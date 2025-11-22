'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import api from '@/lib/api'

// --- INTERFACES ---
interface Event {
    id: number;
    title: string;
    slug: string;
    start_datetime: string;
    end_datetime: string;
    description: string | null;
    location: string;
    address: string;
    capacity: number;
    published: boolean;
}

interface SubEvent {
    id: number;
    event: number; 
    title: string;
    start_datetime: string;
    end_datetime: string; 
    capacity: number;
}

interface TicketType {
    id: number;
    event: number; 
    name: string;
    price: number | string; 
    reservation_fee: number | string; 
    quantity_available: number;
}

type ResourceType = 'events' | 'sub-events' | 'ticket-types';

// --- API ENDPOINTS ---
const API_URLS = {
    EVENTS: 'events/events/',
    EVENT_DETAIL: (slug: string) => `events/events/${slug}/`,
    SUB_EVENTS: 'events/sub-events/',
    SUB_EVENT_DETAIL: (pk: number) => `events/sub-events/${pk}/`,
    TICKET_TYPES: 'events/ticket-types/',
    TICKET_TYPE_DETAIL: (pk: number) => `events/ticket-types/${pk}/`,
}

// Helper functions 
const toLocalDatetime = (isoString: string | undefined | null) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
};

const getDefaultFormState = (type: ResourceType) => {
    const defaultDateTime = toLocalDatetime(new Date().toISOString());
    
    if (type === 'events') {
        return { title: '', description: '', location: '', address: '', capacity: 10, start_datetime: defaultDateTime, end_datetime: toLocalDatetime(new Date(Date.now() + 3600000).toISOString()), published: false };
    }
    if (type === 'sub-events') {
        return { event: 1, title: '', capacity: 10, start_datetime: defaultDateTime, end_datetime: toLocalDatetime(new Date(Date.now() + 3600000).toISOString()) };
    }
    if (type === 'ticket-types') {
        return { event: 1, name: '', price: 0.00, reservation_fee: 0.00, quantity_available: 100 };
    }
    return {};
};

// FIX: Robust function to extract array data from various DRF response formats
const extractListData = (response: any): any[] => {
    if (!response || !response.data) return [];
    
    // Check for DRF paginated format: { results: [...], count: 0, ...}
    if (Array.isArray(response.data.results)) {
        return response.data.results;
    }
    
    // Check for non-paginated list format: [...]
    if (Array.isArray(response.data)) {
        return response.data;
    }
    
    return [];
};


// --- Main Component ---

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [subEvents, setSubEvents] = useState<SubEvent[]>([])
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ResourceType>('events');

  // Unified CRUD State
  const [modalState, setModalState] = useState({
      isOpen: false,
      resourceType: 'events' as ResourceType,
      data: {} as any, // Holds the form data based on resourceType
      currentSlugOrPk: null as string | number | null,
  });

  // FIX: Safe lookup map to resolve resourceType to API_URLS key
  const RESOURCE_URL_MAP = {
      'events': API_URLS.EVENTS,
      'sub-events': API_URLS.SUB_EVENTS,
      'ticket-types': API_URLS.TICKET_TYPES,
  };


  // --- API FETCHING ---
  const fetchEvents = async () => {
    setLoading(true);
    try {
        const [eventsRes, subEventsRes, ticketsRes] = await Promise.all([
            api.get(API_URLS.EVENTS),
            api.get(API_URLS.SUB_EVENTS),
            api.get(API_URLS.TICKET_TYPES)
        ]);
        
        // FIX: Use robust extraction logic
        setEvents(extractListData(eventsRes));
        setSubEvents(extractListData(subEventsRes));
        setTicketTypes(extractListData(ticketsRes));

    } catch (error) {
        console.error('Error fetching all event data:', error);
        // Display alert so user knows fetch failed
        alert('Failed to load event data. Check server logs.');
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, [])

  // --- CRUD HANDLERS ---
  
  const openModalForCreation = () => {
      setModalState({
          isOpen: true,
          resourceType: activeTab,
          data: getDefaultFormState(activeTab),
          currentSlugOrPk: null,
      });
  };
  
  const openModalForEdit = (resource: any) => { 
      let data: any;
      let currentSlugOrPk;
      const type = activeTab;

      if (type === 'events') {
          data = {
              title: resource.title,
              description: resource.description || '', // Null check
              location: resource.location,
              address: resource.address,
              capacity: resource.capacity,
              start_datetime: toLocalDatetime(resource.start_datetime),
              end_datetime: toLocalDatetime(resource.end_datetime),
              published: resource.published,
          };
          currentSlugOrPk = resource.slug;
      } 
      else if (type === 'sub-events') {
          data = {
              title: resource.title,
              capacity: resource.capacity,
              event: resource.event,
              start_datetime: toLocalDatetime(resource.start_datetime),
              end_datetime: toLocalDatetime(resource.end_datetime),
          };
          currentSlugOrPk = resource.id;
      }
      else if (type === 'ticket-types') {
          data = {
              name: resource.name,
              // Convert prices to float for editing form state
              price: parseFloat(resource.price), 
              reservation_fee: parseFloat(resource.reservation_fee),
              quantity_available: resource.quantity_available,
              event: resource.event,
          };
          currentSlugOrPk = resource.id;
      }
      
      setModalState({
          isOpen: true,
          resourceType: activeTab,
          data: data!,
          currentSlugOrPk: currentSlugOrPk,
      });
  };

  const handleDelete = async (resource: any) => { 
    let url;
    let identifier;

    if (activeTab === 'events') {
        identifier = resource.slug;
        url = API_URLS.EVENT_DETAIL(resource.slug);
    } else if (activeTab === 'sub-events') {
        identifier = resource.id;
        url = API_URLS.SUB_EVENT_DETAIL(resource.id);
    } else if (activeTab === 'ticket-types') {
        identifier = resource.id;
        url = API_URLS.TICKET_TYPE_DETAIL(resource.id);
    }

    if (!window.confirm(`Are you sure you want to delete ${activeTab.slice(0, -1)}: ${identifier}?`)) return;
    
    try {
        await api.delete(url!);
        alert(`${activeTab.slice(0, -1)} deleted successfully.`);
        fetchEvents(); 
    } catch (error) {
        console.error(`Error deleting ${activeTab}:`, error);
        alert('Failed to delete resource. Check permissions.');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let url: string;
    let method: 'post' | 'patch';
    let dataToSend: any;

    // 1. Determine URL and method
    if (modalState.currentSlugOrPk) {
        method = 'patch';
        if (modalState.resourceType === 'events') {
            url = API_URLS.EVENT_DETAIL(modalState.currentSlugOrPk as string);
        } else if (modalState.resourceType === 'sub-events') {
            url = API_URLS.SUB_EVENT_DETAIL(modalState.currentSlugOrPk as number);
        } else {
            url = API_URLS.TICKET_TYPE_DETAIL(modalState.currentSlugOrPk as number);
        }
    } else {
        method = 'post';
        url = RESOURCE_URL_MAP[modalState.resourceType];
    }

    // 2. Process form state to match API expectations
    const data = modalState.data;
    if (modalState.resourceType === 'events' || modalState.resourceType === 'sub-events') {
        dataToSend = {
            ...data,
            capacity: Number(data.capacity),
            start_datetime: new Date(data.start_datetime).toISOString(),
            end_datetime: new Date(data.end_datetime).toISOString(),
            event: data.event ? Number(data.event) : undefined, 
        };
    } else if (modalState.resourceType === 'ticket-types') {
        dataToSend = {
            ...data,
            // Convert to string and fix to 2 decimal places as expected by Django DecimalField
            price: Number(data.price).toFixed(2), 
            reservation_fee: Number(data.reservation_fee).toFixed(2),
            quantity_available: Number(data.quantity_available),
            event: Number(data.event),
        };
    }
    
    try {
        if (method === 'post') {
            await api.post(url!, dataToSend); 
        } else {
            await api.patch(url!, dataToSend);
        }
        alert(`${modalState.resourceType.slice(0, -1)} saved successfully.`);
        fetchEvents();
        setModalState({ ...modalState, isOpen: false });
    } catch (error: any) {
        console.error('Error submitting form:', error.response?.data || error);
        alert(`Failed to save resource: ${JSON.stringify(error.response?.data || 'Unknown Error')}`);
    }
  }

  // --- Dynamic Form Renderer (omitted for brevity, assume it's working) ---
  const renderFormFields = () => {
    const field = (name: string, type: string = 'text', label: string, required: boolean = true) => (
        <div key={name}>
            <label className='block text-sm font-medium text-charcoal-700'>{label} {required && '*'}</label>
            <input 
                type={type}
                required={required}
                value={modalState.data[name] || (type === 'number' ? 0 : '')}
                onChange={(e) => setModalState({ ...modalState, data: { ...modalState.data, [name]: e.target.value } })}
                className='mt-1 block w-full border border-charcoal-300 rounded-md shadow-sm p-2'
            />
        </div>
    );

    const textArea = (name: string, label: string) => (
        <div key={name}>
            <label className='block text-sm font-medium text-charcoal-700'>{label} *</label>
            <textarea 
                required
                rows={3}
                value={modalState.data[name] || ''}
                onChange={(e) => setModalState({ ...modalState, data: { ...modalState.data, [name]: e.target.value } })}
                className='mt-1 block w-full border border-charcoal-300 rounded-md shadow-sm p-2 resize-none'
            />
        </div>
    );
    
    const selectEvent = (name: string, label: string) => (
        <div key={name}>
            <label className='block text-sm font-medium text-charcoal-700'>{label} *</label>
            <select
                required
                value={modalState.data[name] || ''}
                onChange={(e) => setModalState({ ...modalState, data: { ...modalState.data, [name]: Number(e.target.value) } })}
                className='mt-1 block w-full border border-charcoal-300 rounded-md shadow-sm p-2'
            >
                <option value="">Select Parent Event</option>
                {events.map(event => (
                    <option key={event.id} value={event.id}>{event.title} (PK: {event.id})</option>
                ))}
            </select>
        </div>
    );

    switch (modalState.resourceType) {
        case 'events':
            return (
                <div className='space-y-4'>
                    <div className='grid grid-cols-2 gap-4'>
                        {field('title', 'text', 'Title')}
                        {field('capacity', 'number', 'Capacity')}
                        {field('location', 'text', 'Location')}
                        {textArea('address', 'Address')}
                        {field('start_datetime', 'datetime-local', 'Start Datetime')}
                        {field('end_datetime', 'datetime-local', 'End Datetime')}
                    </div>
                    {textArea('description', 'Description')}
                    <div className="flex items-center">
                        <input id="published" type="checkbox" checked={modalState.data.published} onChange={(e) => setModalState({...modalState, data: { ...modalState.data, published: e.target.checked }})} className='h-4 w-4 text-primary-600 border-charcoal-300 rounded' />
                        <label htmlFor="published" className='ml-2 text-sm font-medium text-charcoal-700'>Published</label>
                    </div>
                </div>
            );
        case 'sub-events':
            return (
                <div className='space-y-4'>
                    {selectEvent('event', 'Parent Event')}
                    <div className='grid grid-cols-2 gap-4'>
                        {field('title', 'text', 'Title')}
                        {field('capacity', 'number', 'Capacity')}
                        {field('start_datetime', 'datetime-local', 'Start Datetime')}
                        {field('end_datetime', 'datetime-local', 'End Datetime')}
                    </div>
                </div>
            );
        case 'ticket-types':
            return (
                <div className='space-y-4'>
                    {selectEvent('event', 'Parent Event')}
                    <div className='grid grid-cols-2 gap-4'>
                        {field('name', 'text', 'Ticket Name')}
                        {field('price', 'number', 'Price', true)}
                        {field('reservation_fee', 'number', 'Reservation Fee', true)}
                        {field('quantity_available', 'number', 'Quantity Available')}
                    </div>
                </div>
            );
        default:
            return null;
    }
  };


  return (
    <div className="py-8"> 
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-serif font-bold text-charcoal-900 mb-2">
              Event Management
            </h1>
            <p className="text-charcoal-600">
              Manage all events, sub-events, and ticket types.
            </p>
          </motion.div>

          {/* Tabs for Resource Switching */}
          <div className="mb-4 border-b border-charcoal-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {['events', 'sub-events', 'ticket-types'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`
                    ${activeTab === tab ? 'border-primary-500 text-primary-600' : 'border-transparent text-charcoal-500 hover:text-charcoal-700 hover:border-charcoal-300'}
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  `}
                >
                  {tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </nav>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-charcoal-900">
                    {activeTab === 'events' && `Event List (${events.length})`}
                    {activeTab === 'sub-events' && `Sub-Event List (${subEvents.length})`}
                    {activeTab === 'ticket-types' && `Ticket Type List (${ticketTypes.length})`}
                </h2>
                <button 
                    onClick={openModalForCreation}
                    className="btn-primary flex items-center"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    New {activeTab.slice(0, -1).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
            </div>
            
            {loading && <p className='text-center text-charcoal-500'>Loading data...</p>}

            {/* --- LIST VIEWS --- */}
            
            {/* EVENTS LIST */}
            {activeTab === 'events' && !loading && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-charcoal-200">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Title (Slug)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Published</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-charcoal-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-charcoal-200">
                            {events.map((event) => (
                                <tr key={event.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-charcoal-900">{event.title} ({event.slug})</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-500">{new Date(event.start_datetime).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-500">{event.location}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${event.published ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {event.published ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => openModalForEdit(event)} className="text-primary-600 hover:text-primary-900 mr-4">
                                            <PencilSquareIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(event)} className="text-red-600 hover:text-red-900">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {/* SUB-EVENTS LIST */}
            {activeTab === 'sub-events' && !loading && (
                <div className="overflow-x-auto">
                     <table className="min-w-full divide-y divide-charcoal-200">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Parent Event ID (PK)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Capacity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Start Time</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-charcoal-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-charcoal-200">
                            {subEvents.map((subEvent) => (
                                <tr key={subEvent.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-charcoal-900">{subEvent.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-500">{subEvent.capacity}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-500">{subEvent.event}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-500">{new Date(subEvent.start_datetime).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => openModalForEdit(subEvent)} className="text-primary-600 hover:text-primary-900 mr-4">
                                            <PencilSquareIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(subEvent)} className="text-red-600 hover:text-red-900">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* TICKET TYPES LIST */}
            {activeTab === 'ticket-types' && !loading && (
                <div className="overflow-x-auto">
                     <table className="min-w-full divide-y divide-charcoal-200">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Price (Fee)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Available</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">Parent Event ID (PK)</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-charcoal-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-charcoal-200">
                            {ticketTypes.map((ticketType) => (
                                <tr key={ticketType.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-charcoal-900">{ticketType.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-500">
                                        R {parseFloat(ticketType.price as string).toFixed(2)} 
                                        (Fee: R {parseFloat(ticketType.reservation_fee as string).toFixed(2)})
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-500">{ticketType.quantity_available}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-500">{ticketType.event}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => openModalForEdit(ticketType)} className="text-primary-600 hover:text-primary-900 mr-4">
                                            <PencilSquareIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(ticketType)} className="text-red-600 hover:text-red-900">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

          </motion.div>

        </div>
        
        {/* Event CRUD Modal */}
        {modalState.isOpen && (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
                <div className='bg-white rounded-lg p-8 w-full max-w-2xl'>
                    <div className='flex justify-between items-center mb-6'>
                        <h3 className='text-2xl font-bold'>
                            {modalState.currentSlugOrPk ? 'Edit ' : 'Create New '}
                            {modalState.resourceType.slice(0, -1).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </h3>
                         <button onClick={() => setModalState({ ...modalState, isOpen: false })}>
                            <XMarkIcon className='w-6 h-6 text-charcoal-500 hover:text-charcoal-700'/>
                        </button>
                    </div>
                   
                    <form onSubmit={handleSubmit} className='space-y-4'>
                        {/* Dynamic Form Fields */}
                        {renderFormFields()}
                        
                        {/* Buttons */}
                        <div className='flex justify-end space-x-3 pt-4'>
                            <button 
                                type="button" 
                                onClick={() => setModalState({ ...modalState, isOpen: false })} 
                                className='btn-secondary'
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className='btn-primary'
                            >
                                {modalState.currentSlugOrPk ? 'Save Changes' : 'Create Resource'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  )
}