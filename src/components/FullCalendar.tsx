'use client';

import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import FullCalendar  from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { collection, addDoc, onSnapshot, query, DocumentData } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig'; // путь к твоему файлу с инициализацией Firebase
import { EventInput } from '@fullcalendar/core/index.js';
interface CalendarEvent extends EventInput {
  id: string;
  title: string;
  start: string;
  end?: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    start: '',
    end: '',
  });

  useEffect(() => {
    const q = query(collection(db, "events"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsArr: CalendarEvent[] = [];
      snapshot.forEach(doc => {
        const data = doc.data() as DocumentData;
        eventsArr.push({
          id: doc.id,
          title: data.title,
          start: data.start,
          end: data.end,
        });
      });
      setEvents(eventsArr);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEvent = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.start) {
      alert("Пожалуйста, введите название и дату начала");
      return;
    }

    try {
      await addDoc(collection(db, "events"), {
        title: formData.title,
        start: formData.start,
        end: formData.end || formData.start,
      });
      setFormData({ title: '', start: '', end: '' });
    } catch (error) {
      console.error("Ошибка при добавлении события:", error);
    }
  };

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <form onSubmit={handleAddEvent} style={{ minWidth: 250 }}>
        <h3>Добавить событие / бронь техники</h3>

        <label>
          Название<br />
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </label><br />

        <label>
          Дата начала<br />
          <input
            type="datetime-local"
            name="start"
            value={formData.start}
            onChange={handleChange}
            required
          />
        </label><br />

        <label>
          Дата окончания<br />
          <input
            type="datetime-local"
            name="end"
            value={formData.end}
            onChange={handleChange}
          />
        </label><br />

        <button type="submit">Добавить</button>
      </form>

      <div style={{ flexGrow: 1 }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="auto"
          selectable={false}
        />
      </div>
    </div>
  );
}
