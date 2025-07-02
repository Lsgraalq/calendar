'use client';

import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { collection, addDoc, onSnapshot, query, DocumentData } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import { fetchEquipment } from '@/utils/fetchEquipment';
import { EventInput } from '@fullcalendar/core';

// ====== Типы данных ======

// Тип для объекта техники из Firestore
type Equipment = {
  id: string;
  name: string;
  description?: string;
  image?: string;
  photoPath?: string;
};

// Перечисление типов событий
type EventType = 'event' | 'note' | 'booking';

// Тип для события календаря
interface CalendarEvent extends EventInput {
  id: string;
  type: EventType;
  equipmentId?: string;
  equipmentName?: string;
}

// ====== Основной компонент ======

export default function CalendarPage() {
  // Состояние для списка событий
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  // Состояние для списка техники
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  // Состояние загрузки календаря
  const [loading, setLoading] = useState(true);

  // Состояние формы для добавления события
  const [formData, setFormData] = useState({
    title: '',
    start: '',
    end: '',
    type: 'event' as EventType,
    equipmentId: '',
  });

  // ====== useEffect для загрузки данных ======
  useEffect(() => {
    // Загрузка списка техники из Firestore
    fetchEquipment().then(setEquipmentList);

    // Подписка на изменения коллекции событий в Firestore
    const q = query(collection(db, 'events'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsArr: CalendarEvent[] = [];
      snapshot.forEach(doc => {
        const data = doc.data() as DocumentData;
        eventsArr.push({
          id: doc.id,
          title: data.type === 'booking'
            ? `Reservierung: ${data.equipmentName}`
            : data.title,
          start: data.start,
          end: data.end,
          type: data.type,
          equipmentId: data.equipmentId,
          color:
            data.type === 'booking' ? 'blue'
            : data.type === 'note' ? 'orange'
            : 'yellow',
        });
      });
      setEvents(eventsArr);
      setLoading(false);
    });

    // Очистка подписки при размонтировании
    return () => unsubscribe();
  }, []);

  // ====== Обработчик изменения формы ======
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ====== Обработчик добавления события ======
  const handleAddEvent = async (e: FormEvent) => {
    e.preventDefault();

    // Проверка обязательных полей
    if (!formData.title || !formData.start) {
      alert('Bitte Titel und Startdatum eingeben');
      return;
    }

    if (formData.type === 'booking' && !formData.equipmentId) {
      alert('Bitte Ausrüstung auswählen');
      return;
    }

    // Поиск выбранной техники по ID
    const selectedEquipment = equipmentList.find(eq => eq.id === formData.equipmentId);

    try {
      // Добавление события в Firestore
      await addDoc(collection(db, 'events'), {
        title: formData.title,
        start: formData.start,
        end: formData.end || formData.start,
        type: formData.type,
        equipmentId: formData.equipmentId || null,
        equipmentName: selectedEquipment?.name || null,
      });

      // Очистка формы после отправки
      setFormData({
        title: '',
        start: '',
        end: '',
        type: 'event',
        equipmentId: '',
      });
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Ereignisses:', error);
    }
  };

  // ====== JSX разметка ======
  return (
    <div
      // Контейнер адаптивный: на мобиле колонки, на десктопе — строка
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 20,
        padding: 20,
        marginTop: 20,
      }}
    >
      {/* ====== Левая колонка: форма добавления события ====== */}
      <div
        style={{
          border: '1px solid #ccc',
          padding: 16,
          borderRadius: 8,
          flex: '1 1 300px',
          maxWidth: 400,
          minWidth: 260,
        }}
      >
        <h3>Ereignis hinzufügen</h3>
        <form
          onSubmit={handleAddEvent}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          {/* Тип события */}
          <label>
            Ereignistyp
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="event">Ereignis</option>
              <option value="note">Notiz</option>
              <option value="booking">Ausrüstung reservieren</option>
            </select>
          </label>

          {/* Название события */}
          <label>
            Titel
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </label>

          {/* Дата начала */}
          <label>
            Startdatum
            <input
              type="datetime-local"
              name="start"
              value={formData.start}
              onChange={handleChange}
              required
            />
          </label>

          {/* Дата окончания */}
          <label>
            Enddatum
            <input
              type="datetime-local"
              name="end"
              value={formData.end}
              onChange={handleChange}
            />
          </label>

          {/* Выбор техники — показывается только если выбрана бронь */}
          {formData.type === 'booking' && (
            <label>
              Ausrüstung auswählen
              <select
                name="equipmentId"
                value={formData.equipmentId}
                onChange={handleChange}
                required
              >
                <option value="">Bitte auswählen</option>
                {equipmentList.map(eq => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          {/* Кнопка отправки формы */}
          <button type="submit">Hinzufügen</button>
        </form>
      </div>

      {/* ====== Правая колонка: сам календарь ====== */}
      <div style={{ flex: '2 1 400px', minWidth: 300 }}>
        {loading ? (
          <p>Kalender wird geladen...</p>
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
