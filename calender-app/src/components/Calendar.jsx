import { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  parse,
} from "date-fns";
import useEvents from "../hooks/useEvents";
import { Dialog } from "@headlessui/react";

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { events, addEvent, editEvent, deleteEvent } = useEvents();
  const [eventForm, setEventForm] = useState({
    name: "",
    startTime: "",
    endTime: "",
    description: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editEventId, setEditEventId] = useState(null);

  const renderHeader = () => {
    const dateFormat = "MMMM yyyy";
    return (
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="text-gray-500">
          Previous
        </button>
        <span className="text-lg font-bold">
          {format(currentMonth, dateFormat)}
        </span>
        <button onClick={nextMonth} className="text-gray-500">
          Next
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const dateFormat = "EEEE";
    const startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="text-center font-medium" key={i}>
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }

    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        days.push(
          <div
            className={`p-2 text-center border rounded-lg ${
              !isSameMonth(day, monthStart) ? "text-gray-400" : ""
            } ${isSameDay(day, selectedDate) ? "bg-blue-500 text-white" : ""}`}
            key={day}
            onClick={() => onDateClick(cloneDay)}>
            <span>{formattedDate}</span>
            {/* Display events for the day */}
            <div>
              {events
                .filter((event) =>
                  isSameDay(parse(event.date, "yyyy-MM-dd", new Date()), day)
                )
                .map((event) => (
                  <div
                    key={event.id}
                    className="text-xs bg-gray-200 mt-1 rounded p-1">
                    {event.name} ({event.startTime} - {event.endTime})
                    <button
                      onClick={() => onEditEvent(event)}
                      className="ml-2 text-blue-500">
                      Edit
                    </button>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="ml-2 text-red-500">
                      Delete
                    </button>
                  </div>
                ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-2" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  const onDateClick = (day) => {
    setSelectedDate(day);
    setIsModalOpen(true);
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventForm({ ...eventForm, [name]: value });
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (isEditMode) {
      updateEvent();
    } else {
      createEvent();
    }
    setEventForm({ name: "", startTime: "", endTime: "", description: "" });
    setIsModalOpen(false);
  };

  const createEvent = () => {
    const newEvent = {
      id: Date.now(),
      date: format(selectedDate, "yyyy-MM-dd"),
      ...eventForm,
    };
    addEvent(newEvent);
  };

  const updateEvent = () => {
    const updatedEvent = {
      id: editEventId,
      date: format(selectedDate, "yyyy-MM-dd"),
      ...eventForm,
    };
    editEvent(updatedEvent);
    setIsEditMode(false);
    setEditEventId(null);
  };

  const onEditEvent = (event) => {
    setEventForm({
      name: event.name,
      startTime: event.startTime,
      endTime: event.endTime,
      description: event.description,
    });
    setEditEventId(event.id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      <div className="mt-4">
        <h2 className="text-lg font-bold">
          {isEditMode ? "Edit Event" : "Add Event"}
        </h2>
        <form onSubmit={handleAddEvent} className="mt-2">
          <input
            type="text"
            name="name"
            value={eventForm.name}
            onChange={handleInputChange}
            placeholder="Event Name"
            className="border p-1 mr-2 rounded"
            required
          />
          <input
            type="time"
            name="startTime"
            value={eventForm.startTime}
            onChange={handleInputChange}
            className="border p-1 mr-2 rounded"
            required
          />
          <input
            type="time"
            name="endTime"
            value={eventForm.endTime}
            onChange={handleInputChange}
            className="border p-1 mr-2 rounded"
            required
          />
          <input
            type="text"
            name="description"
            value={eventForm.description}
            onChange={handleInputChange}
            placeholder="Description (optional)"
            className="border p-1 mr-2 rounded"
          />
          <button type="submit" className="bg-blue-500 text-white p-1 rounded">
            {isEditMode ? "Update Event" : "Add Event"}
          </button>
        </form>
      </div>
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="fixed inset-0 bg-black bg-opacity-30" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded p-4">
            <h2 className="text-lg font-bold">
              Events on {format(selectedDate, "MMMM d, yyyy")}
            </h2>
            <div>
              {events
                .filter((event) =>
                  isSameDay(
                    parse(event.date, "yyyy-MM-dd", new Date()),
                    selectedDate
                  )
                )
                .map((event) => (
                  <div
                    key={event.id}
                    className="text-xs bg-gray-200 mt-1 rounded p-2">
                    <div className="font-bold">{event.name}</div>
                    <div>
                      {event.startTime} - {event.endTime}
                    </div>
                    <div>{event.description}</div>
                    <button
                      onClick={() => onEditEvent(event)}
                      className="ml-2 text-blue-500">
                      Edit
                    </button>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="ml-2 text-red-500">
                      Delete
                    </button>
                  </div>
                ))}
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 bg-blue-500 text-white p-1 rounded">
              Close
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default Calendar;
