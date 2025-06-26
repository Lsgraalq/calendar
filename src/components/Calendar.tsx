"use client";

import Calendar from "react-calendar";
import { useState, useEffect } from "react";
import 'react-calendar/dist/Calendar.css';
import { getDocs, collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

type Booking = {
  date: string;
  startTime: string;
  endTime: string;
};

export default function BookingCalendar() {
  const [date, setDate] = useState<Date>(new Date());
  const [equipment, setEquipment] = useState<{ id: string; name: string }[]>([]);
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("10:00");

  useEffect(() => {
    const fetchEquipment = async () => {
      const snapshot = await getDocs(collection(db, "equipment"));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setEquipment(data);
      if (data.length > 0 && !selectedItem) setSelectedItem(data[0].id);
    };
    fetchEquipment();
  }, []);

  useEffect(() => {
    if (!selectedItem) return;
    const fetchBookings = async () => {
      const snapshot = await getDocs(collection(db, `equipment/${selectedItem}/bookings`));
      const data = snapshot.docs.map(doc => doc.data() as Booking);
      setBookings(data);
    };
    fetchBookings();
  }, [selectedItem]);

  const isoDate = date.toISOString().split("T")[0];

  // Временные слоты с шагом 30 минут
  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let h = 0; h < 24; h++) {
      slots.push(`${h.toString().padStart(2, "0")}:00`);
      slots.push(`${h.toString().padStart(2, "0")}:30`);
    }
    return slots;
  };
  const timeSlots = generateTimeSlots();

  // Проверка, свободен ли выбранный интервал брони
  const isIntervalFree = (start: string, end: string) => {
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    if (endMinutes <= startMinutes) return false;

    for (const b of bookings) {
      if (b.date !== isoDate) continue;

      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);

      // Проверка пересечения интервалов
      if (!(endMinutes <= bStart || startMinutes >= bEnd)) {
        return false; // есть пересечение — занято
      }
    }
    return true;
  };

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const handleBooking = async () => {
    if (!selectedItem) return alert("Выберите технику");
    if (!isIntervalFree(startTime, endTime)) return alert("Выбранное время занято или некорректно");

    try {
      await addDoc(collection(db, `equipment/${selectedItem}/bookings`), {
        date: isoDate,
        startTime,
        endTime,
        createdAt: new Date().toISOString(),
      });
      alert("Бронь добавлена");
      setStartTime("09:00");
      setEndTime("10:00");

      // обновим брони
      const snapshot = await getDocs(collection(db, `equipment/${selectedItem}/bookings`));
      const data = snapshot.docs.map(doc => doc.data() as Booking);
      setBookings(data);
    } catch (error) {
      alert("Ошибка при добавлении брони");
      console.error(error);
    }
  };

  return (
    <div className="p-4">
      <label className="block mb-2 text-lg font-bold">Выберите технику или зал:</label>
      <select
        value={selectedItem}
        onChange={(e) => setSelectedItem(e.target.value)}
        className="p-2 border rounded mb-4"
      >
        {equipment.map(item => (
          <option key={item.id} value={item.id}>{item.name}</option>
        ))}
      </select>

      <Calendar
        onChange={(value: Date) => setDate(value)}
        value={date}
        tileClassName={({ date }) => {
          const iso = date.toISOString().split("T")[0];
          const isBooked = bookings.some(b => b.date === iso);
          return isBooked ? "bg-red-300 text-white" : "";
        }}
      />

      <div className="mt-4">
        <h2 className="font-bold mb-2">Выберите время бронирования на {date.toLocaleDateString()}</h2>
        <div className="flex gap-4 items-center">
          <div>
            <label>Начало:</label>
            <select
              value={startTime}
              onChange={e => {
                setStartTime(e.target.value);
                // если конец раньше или равен новому старту, сдвинуть конец на +30 мин
                if (timeToMinutes(endTime) <= timeToMinutes(e.target.value)) {
                  const newEnd = addMinutes(e.target.value, 30);
                  setEndTime(newEnd);
                }
              }}
              className="p-2 border rounded"
            >
              {timeSlots.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Конец:</label>
            <select
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="p-2 border rounded"
            >
              {timeSlots.filter(t => timeToMinutes(t) > timeToMinutes(startTime)).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleBooking}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
        >
          Забронировать
        </button>
      </div>
    </div>
  );
}

// Вспомогательная функция для добавления минут к строке времени "HH:MM"
function addMinutes(time: string, minsToAdd: number): string {
  const [h, m] = time.split(":").map(Number);
  let totalMinutes = h * 60 + m + minsToAdd;
  if (totalMinutes >= 24 * 60) totalMinutes = 24 * 60 - 1; // не больше 23:59
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}
