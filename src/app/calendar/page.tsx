'use client';
import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { collection, addDoc, onSnapshot, query, DocumentData } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

import { EventInput } from '@fullcalendar/core/index.js';

// Тип техники
type Equipment = {
  id: string;
  name: string;
  description?: string;
  image?: string;
  photoPath?: string;
};

// Тип события
type EventType = 'event' | 'note' | 'booking';

interface CalendarEvent extends EventInput {
  id: string;
  type: EventType;
  equipmentId?: string;
  equipmentName?: string;
}

// Начальный список техники
const equipmentList: Equipment[] = [
  { id: '1', name: 'Камера Sony', description: '4K камера' },
  { id: '2', name: 'Штатив Manfrotto', description: 'Устойчивый штатив' },
  { id: '3', name: 'Свет Softbox', description: 'Мягкий свет' },
];

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Форма
  const [formData, setFormData] = useState<{
    title: string;
    start: string;
    end: string;
    type: EventType;
    equipmentId: string;
  }>({
    title: '',
    start: '',
    end: '',
    type: 'event',
    equipmentId: '',
  });

  // Загрузка событий из Firestore
  useEffect(() => {
    const q = query(collection(db, 'events'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsArr: CalendarEvent[] = [];
      snapshot.forEach(doc => {
        const data = doc.data() as DocumentData;
        eventsArr.push({
          id: doc.id,
          title: data.type === 'booking'
            ? `Бронь: ${data.equipmentName}`
            : data.title,
          start: data.start,
          end: data.end,
          type: data.type,
          equipmentId: data.equipmentId,
          color: data.type === 'booking'
            ? 'red'
            : data.type === 'note'
              ? 'orange'
              : 'blue',
        });
      });
      setEvents(eventsArr);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Обработка формы
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEvent = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.start) {
      alert('Введите название и дату начала');
      return;
    }

    if (formData.type === 'booking' && !formData.equipmentId) {
      alert('Выберите технику для брони');
      return;
    }

    const selectedEquipment = equipmentList.find(eq => eq.id === formData.equipmentId);

    try {
      await addDoc(collection(db, 'events'), {
        title: formData.title,
        start: formData.start,
        end: formData.end || formData.start,
        type: formData.type,
        equipmentId: formData.equipmentId || null,
        equipmentName: selectedEquipment?.name || null,
      });

      setFormData({
        title: '',
        start: '',
        end: '',
        type: 'event',
        equipmentId: '',
      });
    } catch (error) {
      console.error('Ошибка при добавлении события:', error);
    }
  };

  return (
    <div className="ml-64 mt-20" style={{ display: 'flex', padding: 20, gap: 20 }}>
      {/* Меню */}
      <div style={{
        border: '1px solid #ccc',
        padding: 16,
        minWidth: 260,
        borderRadius: 8
      }}>
        <h3>Добавить событие</h3>

        <form onSubmit={handleAddEvent} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label>
            Тип события
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="event">Событие</option>
              <option value="note">Заметка</option>
              <option value="booking">Бронь техники</option>
            </select>
          </label>

          <label>
            Название
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Дата начала
            <input
              type="datetime-local"
              name="start"
              value={formData.start}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Дата окончания
            <input
              type="datetime-local"
              name="end"
              value={formData.end}
              onChange={handleChange}
            />
          </label>

          {formData.type === 'booking' && (
            <label>
              Выбрать технику
              <select
                name="equipmentId"
                value={formData.equipmentId}
                onChange={handleChange}
                required
              >
                <option value="">-- Выберите --</option>
                {equipmentList.map(eq => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <button type="submit">Добавить</button>
        </form>
      </div>

      {/* Календарь */}
      <div style={{ flexGrow: 1 }}>
        {loading ? (
          <p>Загрузка календаря...</p>
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            height="auto"
          />
        )}
      </div>
    </div>
  );
}
