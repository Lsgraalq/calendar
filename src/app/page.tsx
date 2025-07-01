"use client";

import { useState, useEffect } from "react";
import "react-calendar/dist/Calendar.css";
import "@/app/globals.css";
import {
  getDocs,
  collection,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { auth } from "../firebase/firebaseConfig";
import { useAuthState } from 'react-firebase-hooks/auth';
  import { useRouter } from "next/navigation";
import MyCalendar from "@/components/FullCalendar";
import Link from "next/navigation";

type Equipment = {
  id: string;
  name: string;
  description?: string;  // описание — необязательно
  image?: string; 
  photoPath?:string;       // путь к картинке
};

type Booking = {
  id?: string;
  date: string; // формат "YYYY-MM-DD"
  startTime: string;
  endTime: string;
  createdAt: string;
};

export default function CalendarPage() {
  const router = useRouter();
  const [user, loading, error] = useAuthState(auth);
  const [date, setDate] = useState<Date>(new Date());
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>("");

  // Для формы бронирования
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("19:00");
  const [showBookingForm, setShowBookingForm] = useState(false);

  // Загрузка оборудования
  useEffect(() => {
    async function fetchEquipment() {
      try {
        const snapshot = await getDocs(collection(db, "equipment"));
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          description: doc.data().description,
          photoPath: doc.data().photoPath,  // вытягиваем путь к картинке
        }));
        setEquipmentList(list);
        if (list.length && !selectedEquipmentId) {
          setSelectedEquipmentId(list[0].id);
        }
      } catch (error) {
        console.error("Ошибка загрузки оборудования:", error);
      }
    }
    fetchEquipment();
  }, []);

  // Загрузка бронирований выбранного оборудования
  useEffect(() => {
    if (!selectedEquipmentId) return;

    async function fetchBookings() {
      try {
        const bookingsSnapshot = await getDocs(
          collection(db, "equipment", selectedEquipmentId, "bookings")
        );

        const bookingsList = bookingsSnapshot.docs.map((doc) => {
          const data = doc.data();

          let bookingDate: Date;
          if (data.date?.toDate) {
            bookingDate = data.date.toDate();
          } else {
            bookingDate = new Date(data.date);
          }
          const dateStr = bookingDate.toISOString().slice(0, 10);

          return {
            id: doc.id,
            date: dateStr,
            startTime: data.startTime,
            endTime: data.endTime,
            createdAt: data.createdAt,
          };
        });

        setBookings(bookingsList);
      } catch (error) {
        console.error("Ошибка загрузки бронирований:", error);
      }
    }
    fetchBookings();
  }, [selectedEquipmentId]);

  useEffect(() => {
  if (!loading && !user) {
    router.push("/login");
  }
}, [user, loading, router]);

  // Массив дат для подсветки
  const bookedDates = bookings.map((b) => {
    const [year, month, day] = b.date.split("-");
    return new Date(+year, +month - 1, +day);
  });

  function isSameDay(d1: Date, d2: Date) {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  function tileClassName({ date: tileDate }: { date: Date }) {
    const booked = bookedDates.find((d) => isSameDay(d, tileDate));
    return booked ? "booked" : null;
  }

  // Фильтруем бронирования на выбранную дату
  const selectedDateStr = date.toISOString().slice(0, 10);
  const bookingsForSelectedDate = bookings.filter(
    (b) => b.date === selectedDateStr
  );

  // Обработчик создания бронирования
  async function handleCreateBooking() {
    if (startTime >= endTime) {
      alert("Время начала должно быть меньше времени окончания");
      return;
    }
    if (!selectedEquipmentId) {
      alert("Выберите оборудование");
      return;
    }

    try {
      const bookingDate = new Date(date);
      const dateOnlyTimestamp = Timestamp.fromDate(
        new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate())
      );

      const bookingData = {
        date: dateOnlyTimestamp,
        startTime,
        endTime,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, "equipment", selectedEquipmentId, "bookings"), bookingData);

      alert("Бронирование создано!");
      setShowBookingForm(false);

      // Обновляем список бронирований
      const bookingsSnapshot = await getDocs(
        collection(db, "equipment", selectedEquipmentId, "bookings")
      );

      const bookingsList = bookingsSnapshot.docs.map((doc) => {
        const data = doc.data();

        let bookingDate: Date;
        if (data.date?.toDate) {
          bookingDate = data.date.toDate();
        } else {
          bookingDate = new Date(data.date);
        }
        const dateStr = bookingDate.toISOString().slice(0, 10);

        return {
          id: doc.id,
          date: dateStr,
          startTime: data.startTime,
          endTime: data.endTime,
          createdAt: data.createdAt,
        };
      });
      setBookings(bookingsList);
    } catch (error) {
      console.error("Ошибка при создании бронирования:", error);
      alert("Ошибка при создании бронирования");
    }
  }
  const selectedEquipment = equipmentList.find((eq) => eq.id === selectedEquipmentId);


  return (
    <div className="p-4 pt-20 w-screen pl-64">
     
      <div className="mx-auto w-full flex flex-row gap-20">
         <a href="/calendar" className=""><h1 className="text-4xl">CALENDAR LINK</h1></a>
        <div>
          <h1 className="text-2xl font-bold mb-4 ml-20">Календарь бронирования</h1>


         <MyCalendar></MyCalendar>
          </div>

        <div className="flex flex-col gap-10">
          <p className="mt-4">
            Выбрана дата: <strong>{date.toLocaleDateString()}</strong>
          </p>

          <div>
            <label className="block mb-2 text-lg font-bold">Выберите оборудование:</label>
            <select
              value={selectedEquipmentId}
              onChange={(e) => setSelectedEquipmentId(e.target.value)}
              className="p-2 border rounded mb-4 w-50 text-black bg-white"
            >
              {equipmentList.map((item) => (
                <option key={item.id} value={item.id} className="w-50 bg-white">
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* Контейнер с id="gamno" */}
          <div id="gamno" className="mt-6  p-4 rounded  bg-gray-800">
            <button
              onClick={() => setShowBookingForm(!showBookingForm)}
              className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {showBookingForm ? "Отменить" : "Добавить бронирование"}
            </button>

            {showBookingForm && (
              <div className="flex flex-col gap-4 mb-6">
                <label className="font-semibold">
                  Время начала:
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="ml-2 border rounded p-1 text-black"
                  />
                </label>

                <label className="font-semibold">
                  Время окончания:
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="ml-2 border rounded p-1 text-black"
                  />
                </label>

                <button
                  onClick={handleCreateBooking}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Сохранить бронирование
                </button>
              </div>
            )}

            <div className="">
              <h3 className="font-bold mb-2">
                Бронирования на {date.toLocaleDateString()}:
              </h3>
              {bookingsForSelectedDate.length === 0 ? (
                <p>Бронирований нет</p>
              ) : (
                <ul className="list-disc list-inside ">
                  {bookingsForSelectedDate.map((b) => (
                    <li key={`${b.date}-${b.startTime}`}>
                      Время: {b.startTime} — {b.endTime}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        
        </div>
         <div id="info" className="mt-8 p-4 rounded bg-gray-800 text-white max-w-md">
        {selectedEquipment ? (
          <>
            <h2 className="text-xl font-bold mb-2">{selectedEquipment.name}</h2>
            {selectedEquipment.photoPath && (
              <img
                src={selectedEquipment.photoPath}
                alt={selectedEquipment.name}
                className="w-full h-auto mb-4 rounded"
              />
            )}
            {selectedEquipment.description && (
              <p>{selectedEquipment.description}</p>
            )}
          </>
        ) : (
          <p>Выберите оборудование для просмотра информации</p>
        )}
      </div>
      </div>

      <style jsx>{`
        .booked {
          background-color: #f87171 !important; /* красный фон */
          color: white !important;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}
