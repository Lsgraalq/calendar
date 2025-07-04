'use client';

import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { collection, addDoc, onSnapshot, query, DocumentData } from 'firebase/firestore';
import { db, auth } from '@/firebase/firebaseConfig';
import { fetchEquipment } from '@/utils/fetchEquipment';
import { EventInput } from '@fullcalendar/core';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";

// ====== Типы данных ======

type Equipment = {
  id: string;
  name: string;
  description?: string;
};

type Room = {
  id: string;
  name: string;
  description?: string;
};

type EventType = 'event' | 'note' | 'booking' | 'roomBooking';

interface CalendarEvent extends EventInput {
  id: string;
  type: EventType;
  description?: string;
  equipmentId?: string;
  equipmentName?: string;
  roomId?: string;
  roomName?: string;
}

// ====== Основной компонент ======

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [roomList, setRoomList] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, logging] = useAuthState(auth);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    start: '',
    end: '',
    description: '',
    type: 'event' as EventType,
    equipmentId: '',
    roomId: '',
  });

  // Загрузка техники и комнат и событий
  useEffect(() => {
    fetchEquipment().then(setEquipmentList);

    // Загрузка комнат из Firestore (коллекция "rooms")
    const roomsQuery = query(collection(db, 'rooms'));
    const unsubscribeRooms = onSnapshot(roomsQuery, (snapshot) => {
      const roomsArr: Room[] = [];
      snapshot.forEach(doc => {
        const data = doc.data() as DocumentData;
        roomsArr.push({
          id: doc.id,
          name: data.name,
          description: data.description,
        });
      });
      setRoomList(roomsArr);
    });

    const eventsQuery = query(collection(db, 'events'));
    const unsubscribeEvents = onSnapshot(eventsQuery, (snapshot) => {
      const eventsArr: CalendarEvent[] = [];
      snapshot.forEach(doc => {
        const data = doc.data() as DocumentData;
        eventsArr.push({
          id: doc.id,
          title: data.type === 'booking'
            ? `Reservierung: ${data.equipmentName}`
            : data.type === 'roomBooking'
              ? `Raumbuchung: ${data.roomName}`
              : data.title,
          start: data.start,
          end: data.end,
          type: data.type,
          description: data.description
            ? `${data.description}\n\nAutor: ${data.author || 'Unbekannt'}`
            : `Autor: ${data.author || 'Unbekannt'}`,
          equipmentId: data.equipmentId || null,
          equipmentName: data.equipmentName || null,
          roomId: data.roomId || null,
          roomName: data.roomName || null,
          color:
            data.type === 'booking' ? 'blue'
            : data.type === 'roomBooking' ? 'green'
            : data.type === 'note' ? 'orange'
            : 'yellow',
        });
      });
      setEvents(eventsArr);
      setLoading(false);
    });

    return () => {
      unsubscribeEvents();
      unsubscribeRooms();
    };
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEvent = async (e: FormEvent) => {
    e.preventDefault();

    if (formData.type !== 'booking' && formData.type !== 'roomBooking' && !formData.title) {
      alert('Bitte Titel eingeben');
      return;
    }
    if (!formData.start) {
      alert('Bitte Startdatum eingeben');
      return;
    }

    if (formData.type === 'booking' && !formData.equipmentId) {
      alert('Bitte Ausrüstung auswählen');
      return;
    }

    if (formData.type === 'roomBooking' && !formData.roomId) {
      alert('Bitte Raum auswählen');
      return;
    }

    const user = auth.currentUser;
    const authorName = user?.displayName || user?.email || 'Unbekannt';

    const selectedEquipment = equipmentList.find(eq => eq.id === formData.equipmentId);
    const selectedRoom = roomList.find(r => r.id === formData.roomId);

    try {
      await addDoc(collection(db, 'events'), {
        title:
          formData.type === 'booking' ? '' :
          formData.type === 'roomBooking' ? '' :
          formData.title,
        start: formData.start,
        end: formData.end || formData.start,
        type: formData.type,
        description: formData.description,
        equipmentId: formData.equipmentId || null,
        equipmentName: selectedEquipment?.name || null,
        roomId: formData.roomId || null,
        roomName: selectedRoom?.name || null,
        author: authorName,
      });

      setFormData({
        title: '',
        start: '',
        end: '',
        description: '',
        type: 'event',
        equipmentId: '',
        roomId: '',
      });
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Ereignisses:', error);
    }
  };

  useEffect(() => {
    if (!logging && !user) {
      router.push("/login");
    }
  }, [user, logging, router]);

  if (logging) {
    return <p>Loading...</p>;
  }
  if (!user) {
    return null; // Пока редирект
  }

  return (
    <div className="min-h-screen bg-white px-5 md:ml-64 md:pt-10">
      <div className='pt-20 flex flex-col-reverse md:flex-row'>

        {/* Левая панель: форма */}
        <div className='text'>
          <h3 className='text-xl text-left font-bold pt-2 pb-5'>Ereignis hinzufügen</h3>
          <form onSubmit={handleAddEvent}>
            {/* Тип события */}
            <div className='flex flex-col text-left pb-4'>
              <label className='text-xl pl-3'>Ereignistyp</label>
              <select
                className='rounded-full max-w-xs md:max-w-[50vh] text-gray-600'
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="event">Ereignis</option>
                <option value="booking">Ausrüstung reservieren</option>
                <option value="roomBooking">Raumbuchung</option>
                {/* <option value="note">Notiz</option> */}
              </select>
            </div>

            {/* Titel скрываем для брони техники и комнат */}
            {formData.type !== 'booking' && formData.type !== 'roomBooking' && (
              <div className='flex flex-col text-left pb-4'>
                <label className='text-xl pl-3'>Titel</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className='rounded-full max-w-xs md:max-w-[50vh] text-gray-600 px-4 py-2'
                />
              </div>
            )}

            {/* Описание */}
            <div className='flex flex-col text-left pb-4'>
              <label className='text-xl pl-3'>Beschreibung</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className='rounded-full max-w-xs md:max-w-[50vh] text-gray-600 px-4 py-2'
              />
            </div>

            {/* Startdatum */}
            <div className='flex flex-col text-left pb-4'>
              <label className='text-xl pl-3'>Startdatum</label>
              <input
                type="datetime-local"
                name="start"
                value={formData.start}
                onChange={handleChange}
                required
                className='rounded-full max-w-xs md:max-w-[50vh] text-gray-600 px-4 py-2'
              />
            </div>

            {/* Enddatum */}
            <div className='flex flex-col text-left pb-4'>
              <label className='text-xl pl-3'>Enddatum</label>
              <input
                type="datetime-local"
                name="end"
                value={formData.end}
                onChange={handleChange}
                className='rounded-full max-w-xs md:max-w-[50vh] text-gray-600 px-4 py-2'
              />
            </div>

            {/* Выбор оборудования для брони */}
            {formData.type === 'booking' && (
              <div className='flex flex-col text-left pb-4'>
                <label className='text-xl pl-3'>Ausrüstung auswählen</label>
                <select
                  name="equipmentId"
                  value={formData.equipmentId}
                  onChange={handleChange}
                  required
                  className='rounded-full max-w-xs md:max-w-[50vh] text-gray-600 px-4 py-2'
                >
                  <option value="">Bitte auswählen</option>
                  {equipmentList.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Выбор комнаты для брони */}
            {formData.type === 'roomBooking' && (
              <div className='flex flex-col text-left pb-4'>
                <label className='text-xl pl-3'>Raum auswählen</label>
                <select
                  name="roomId"
                  value={formData.roomId}
                  onChange={handleChange}
                  required
                  className='rounded-full max-w-xs md:max-w-[50vh] text-gray-600 px-4 py-2'
                >
                  <option value="">Bitte auswählen</option>
                  {roomList.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Кнопка */}
            <div className="w-50 mx-auto text-center bg-purple-500 rounded-full mb-15 mt-5">
              <button type="submit" className='pt-3 pb-3'>
                Hinzufügen
              </button>
            </div>
          </form>
        </div>

        {/* Правая панель: календарь */}
        <div className="rounded-xl shadow-lg w-full max-w-screen-lg mx-auto p-5 mb-5 clndr-class">
          {loading ? (
            <p className="text-center text-lg text-gray-700">Kalender wird geladen...</p>
          ) : (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={events}
              height="auto"
              eventDidMount={(info) => {
                if (info.event.extendedProps.description) {
                  tippy(info.el, {
                    content: info.event.extendedProps.description,
                    placement: 'top',
                    theme: 'light-border',
                    arrow: true,
                    delay: [100, 0]
                  });
                }
              }}
            />
          )}
        </div>

      </div>
    </div>
  );
}
