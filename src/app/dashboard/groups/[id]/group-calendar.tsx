"use client"

import { useState, useEffect, useTransition } from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Trash2, X, Clock, AlignLeft } from "lucide-react"
import type { CalendarEvent } from "@backend/core/entities/calendar-event.schema"

type CalendarHorizon = "day" | "week" | "month" | "year"

interface Props {
  groupId: string
  isOfficer: boolean
  currentUserId: string
}

export function GroupCalendar({ groupId, isOfficer, currentUserId }: Props) {
  const [currentHorizon, setCurrentHorizon] = useState<CalendarHorizon>("month")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState("")

  // Modals & Popovers
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  // Form State
  const [formTitle, setFormTitle] = useState("")
  const [formDesc, setFormDesc] = useState("")
  const [formStartDate, setFormStartDate] = useState("")
  const [formStartTime, setFormStartTime] = useState("09:00")
  const [formEndDate, setFormEndDate] = useState("")
  const [formEndTime, setFormEndTime] = useState("10:00")
  const [formIsAllDay, setFormIsAllDay] = useState(false)
  const [formError, setFormError] = useState("")

  // Fetch Events when date or horizon changes
  useEffect(() => {
    let startRange = new Date(selectedDate)
    let endRange = new Date(selectedDate)

    if (currentHorizon === "month") {
      startRange = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1)
      endRange = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 2, 0)
    } else if (currentHorizon === "week") {
      const dayOfWeek = selectedDate.getDay()
      startRange = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - dayOfWeek - 7)
      endRange = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + (6 - dayOfWeek) + 7)
    } else if (currentHorizon === "day") {
      startRange = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 2)
      endRange = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 2)
    } else if (currentHorizon === "year") {
      startRange = new Date(selectedDate.getFullYear(), 0, 1)
      endRange = new Date(selectedDate.getFullYear(), 11, 31)
    }

    const fetchEvents = async () => {
      try {
        const res = await fetch(
          `/api/groups/${groupId}/events?start=${startRange.toISOString()}&end=${endRange.toISOString()}`
        )
        if (res.ok) {
          const data = await res.json()
          setEvents(data)
        }
      } catch {
        setErrorMsg("Failed to sync calendar events.")
      }
    }

    startTransition(fetchEvents)
  }, [selectedDate, currentHorizon, groupId])

  // Reset form helper
  const openNewEventModal = () => {
    const todayStr = new Date().toISOString().split("T")[0]
    setFormTitle("")
    setFormDesc("")
    setFormStartDate(todayStr)
    setFormEndDate(todayStr)
    setFormStartTime("09:00")
    setFormEndTime("10:00")
    setFormIsAllDay(false)
    setFormError("")
    setShowAddModal(true)
  }

  // Navigation handlers
  const handleNavigate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate)
    if (currentHorizon === "month") {
      newDate.setMonth(selectedDate.getMonth() + (direction === "next" ? 1 : -1))
    } else if (currentHorizon === "week") {
      newDate.setDate(selectedDate.getDate() + (direction === "next" ? 7 : -7))
    } else if (currentHorizon === "day") {
      newDate.setDate(selectedDate.getDate() + (direction === "next" ? 1 : -1))
    } else if (currentHorizon === "year") {
      newDate.setFullYear(selectedDate.getFullYear() + (direction === "next" ? 1 : -1))
    }
    setSelectedDate(newDate)
  }

  // Submit Handler
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) {
      setFormError("Title is required.")
      return
    }

    const startIso = formIsAllDay
      ? new Date(`${formStartDate}T00:00:00Z`).toISOString()
      : new Date(`${formStartDate}T${formStartTime}:00`).toISOString()

    const endIso = formIsAllDay
      ? new Date(`${formEndDate}T23:59:59Z`).toISOString()
      : new Date(`${formEndDate}T${formEndTime}:00`).toISOString()

    if (new Date(endIso) < new Date(startIso)) {
      setFormError("End time cannot be before start time.")
      return
    }

    setFormError("")
    startTransition(async () => {
      try {
        const res = await fetch(`/api/groups/${groupId}/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formTitle,
            description: formDesc,
            startTime: startIso,
            endTime: endIso,
            isAllDay: formIsAllDay,
          }),
        })

        const data = await res.json()
        if (res.ok && data.success) {
          setEvents((prev) => [...prev, data.event])
          setShowAddModal(false)
        } else {
          setFormError(data.message || "Failed to create event.")
        }
      } catch {
        setFormError("An unexpected error occurred.")
      }
    })
  }

  // Delete Handler
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return

    startTransition(async () => {
      try {
        const res = await fetch(`/api/events/${eventId}`, {
          method: "DELETE",
        })

        const data = await res.json()
        if (res.ok && data.success) {
          setEvents((prev) => prev.filter((e) => e.id !== eventId))
          setSelectedEvent(null)
        } else {
          alert(data.message || "Failed to delete event.")
        }
      } catch {
        alert("An unexpected error occurred.")
      }
    })
  }

  // Get days in month view helper
  const getMonthViewDays = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const firstDayIndex = new Date(year, month, 1).getDay()
    const totalDays = new Date(year, month + 1, 0).getDate()

    const days: { date: Date; isCurrentMonth: boolean }[] = []

    // Padding from previous month
    const prevMonthDays = new Date(year, month, 0).getDate()
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
      })
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      })
    }

    // Padding for next month to complete standard grid rows (up to 42 cells)
    const remainingCells = 42 - days.length
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      })
    }

    return days
  }

  // Get week days view helper
  const getWeekViewDays = () => {
    const startOfWeek = new Date(selectedDate)
    const dayOfWeek = selectedDate.getDay()
    startOfWeek.setDate(selectedDate.getDate() - dayOfWeek)

    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek)
      d.setDate(startOfWeek.getDate() + i)
      days.push(d)
    }
    return days
  }

  // Check if an event matches a specific date day-bounds
  const isEventOnDate = (event: CalendarEvent, date: Date) => {
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
    const dateEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)
    const eventStart = new Date(event.startTime)
    const eventEnd = new Date(event.endTime)

    return eventStart <= dateEnd && eventEnd >= dateStart
  }

  return (
    <div className="space-y-6">
      {/* Horizon & Navigation Header */}
      <div className="bg-surface border border-border rounded-xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-page border border-border rounded-xl p-1">
            <button
              onClick={() => handleNavigate("prev")}
              className="p-2 text-muted hover:text-body hover:bg-surface rounded-lg transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-3.5 py-1 text-xs font-semibold text-body hover:bg-surface rounded-lg transition-all cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={() => handleNavigate("next")}
              className="p-2 text-muted hover:text-body hover:bg-surface rounded-lg transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <h2 className="text-sm font-semibold text-body tracking-tight min-w-[130px] text-center sm:text-left">
            {currentHorizon === "year" && selectedDate.getFullYear()}
            {currentHorizon === "month" &&
              selectedDate.toLocaleString("default", { month: "long", year: "numeric" })}
            {currentHorizon === "week" &&
              `Week of ${getWeekViewDays()[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })}`}
            {currentHorizon === "day" &&
              selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
          </h2>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          {/* Horizon tabs */}
          <div className="flex bg-page p-1 rounded-xl border border-border">
            {(["day", "week", "month", "year"] as CalendarHorizon[]).map((horizon) => (
              <button
                key={horizon}
                onClick={() => setCurrentHorizon(horizon)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                  currentHorizon === horizon
                    ? "bg-brand text-page shadow-md"
                    : "text-muted hover:text-body"
                }`}
              >
                {horizon}
              </button>
            ))}
          </div>

          {/* Add Event Button */}
          {isOfficer && (
            <button
              onClick={openNewEventModal}
              className="flex items-center gap-1.5 bg-brand-subtle border border-brand/20 text-brand-light font-semibold text-xs py-2 px-3.5 rounded-xl hover:bg-brand-lighter/20 hover:border-brand-light/30 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus size={14} />
              Add Event
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-xs text-error font-medium">
          {errorMsg}
        </div>
      )}

      {/* Dynamic Horizons Canvas Grid */}
      <div className="bg-surface/30 border border-border rounded-2xl overflow-hidden shadow-xl p-1 bg-surface">
        {/* MONTH VIEW */}
        {currentHorizon === "month" && (
          <div className="grid grid-cols-7 gap-px bg-border/20 rounded-xl overflow-hidden">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
              <div key={dayName} className="bg-page py-2.5 text-center text-[10px] font-semibold tracking-wider text-muted uppercase">
                {dayName}
              </div>
            ))}
            {getMonthViewDays().map(({ date, isCurrentMonth }, i) => {
              const dayEvents = events.filter((e) => isEventOnDate(e, date))
              const isToday = new Date().toDateString() === date.toDateString()

              return (
                <div
                  key={i}
                  className={`min-h-[120px] bg-page p-2 flex flex-col justify-between border border-border/20 hover:bg-surface/30 transition-all ${
                    isCurrentMonth ? "" : "opacity-35"
                  }`}
                >
                  <div className="flex justify-end mb-1.5">
                    <span
                      className={`text-xs font-bold leading-none w-5 h-5 flex items-center justify-center rounded-full ${
                        isToday ? "bg-brand text-page shadow-md" : "text-muted"
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[85px] scrollbar-thin">
                    {dayEvents.slice(0, 3).map((e) => (
                      <button
                        key={e.id}
                        onClick={() => setSelectedEvent(e)}
                        className="w-full text-left text-[9px] bg-brand-subtle/50 border border-brand-light/10 text-brand-light px-1.5 py-1 rounded font-medium truncate hover:bg-brand-lighter/25 hover:border-brand-light/35 transition-all cursor-pointer"
                      >
                        {e.title}
                      </button>
                    ))}
                    {dayEvents.length > 3 && (
                      <button
                        onClick={() => {
                          setSelectedDate(date)
                          setCurrentHorizon("day")
                        }}
                        className="text-[9px] text-muted hover:text-body text-center font-semibold pt-0.5 cursor-pointer"
                      >
                        +{dayEvents.length - 3} more
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* WEEK VIEW */}
        {currentHorizon === "week" && (
          <div className="flex flex-col rounded-xl overflow-hidden bg-page">
            <div className="grid grid-cols-8 border-b border-border/30 bg-surface/50">
              <div className="border-r border-border/30 py-3 text-center text-[10px] font-semibold text-muted uppercase">Hour</div>
              {getWeekViewDays().map((date, idx) => {
                const isToday = new Date().toDateString() === date.toDateString()
                return (
                  <div
                    key={idx}
                    className={`py-2 text-center border-r border-border/20 last:border-0 ${isToday ? "bg-brand-subtle/10" : ""}`}
                  >
                    <p className="text-[10px] font-semibold text-muted uppercase">
                      {date.toLocaleDateString(undefined, { weekday: "short" })}
                    </p>
                    <p
                      className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full mx-auto mt-0.5 ${
                        isToday ? "bg-brand text-page shadow-sm" : "text-body"
                      }`}
                    >
                      {date.getDate()}
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="flex-1 overflow-y-auto max-h-[600px] scrollbar-thin relative flex">
              {/* Hour Labels */}
              <div className="w-1/8 border-r border-border/30 bg-surface/10 divide-y divide-border/20 flex flex-col">
                {Array.from({ length: 24 }).map((_, hour) => (
                  <div key={hour} className="h-16 flex items-start justify-center pr-2 pt-1 text-[9px] font-semibold text-muted">
                    {hour.toString().padStart(2, "0")}:00
                  </div>
                ))}
              </div>

              {/* Day Columns */}
              <div className="flex-1 grid grid-cols-7 divide-x divide-border/20 relative">
                {getWeekViewDays().map((date, dayIdx) => {
                  const dayEvents = events.filter((e) => isEventOnDate(e, date) && !e.isAllDay)
                  const allDayEvents = events.filter((e) => isEventOnDate(e, date) && e.isAllDay)

                  return (
                    <div key={dayIdx} className="relative h-[1536px] bg-page/5 hover:bg-surface/5 transition-all">
                      {/* Hour slots background grid lines */}
                      {Array.from({ length: 24 }).map((_, hour) => (
                        <div key={hour} className="absolute left-0 right-0 h-px bg-border/10" style={{ top: `${hour * 64}px` }} />
                      ))}

                      {/* Render All Day Events at the top */}
                      {allDayEvents.map((e) => (
                        <button
                          key={e.id}
                          onClick={() => setSelectedEvent(e)}
                          className="absolute left-1 right-1 bg-brand text-page text-[9px] font-semibold px-1.5 py-1 rounded shadow truncate z-10 cursor-pointer"
                          style={{ top: "4px" }}
                        >
                          [All Day] {e.title}
                        </button>
                      ))}

                      {/* Render standard events absolutely */}
                      {dayEvents.map((e) => {
                        const start = new Date(e.startTime)
                        const end = new Date(e.endTime)
                        const startHour = start.getHours() + start.getMinutes() / 60
                        const duration = Math.max(0.5, (end.getTime() - start.getTime()) / (1000 * 60 * 60))

                        const topOffset = startHour * 64
                        const height = duration * 64

                        return (
                          <button
                            key={e.id}
                            onClick={() => setSelectedEvent(e)}
                            className="absolute left-1.5 right-1.5 bg-brand-subtle/80 border border-brand-light/20 text-brand-light rounded-lg p-2 shadow-md hover:bg-brand-lighter/20 hover:border-brand-light/40 transition-all text-left flex flex-col justify-between overflow-hidden z-10 cursor-pointer"
                            style={{ top: `${topOffset}px`, height: `${height}px` }}
                          >
                            <div>
                              <p className="text-[9px] font-bold tracking-tight truncate leading-tight mb-0.5">{e.title}</p>
                              {duration >= 1 && <p className="text-[8px] opacity-75 truncate leading-none">{e.description}</p>}
                            </div>
                            {duration >= 0.75 && (
                              <div className="flex items-center gap-0.5 text-[8px] opacity-75">
                                <Clock size={8} />
                                <span>{start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* DAY VIEW */}
        {currentHorizon === "day" && (
          <div className="flex flex-col bg-page rounded-xl overflow-hidden">
            <div className="flex-1 overflow-y-auto max-h-[600px] scrollbar-thin relative flex">
              {/* Hour Labels */}
              <div className="w-16 border-r border-border/30 bg-surface/10 divide-y divide-border/20 flex flex-col">
                {Array.from({ length: 24 }).map((_, hour) => (
                  <div key={hour} className="h-16 flex items-start justify-center pr-2.5 pt-1.5 text-[10px] font-semibold text-muted">
                    {hour.toString().padStart(2, "0")}:00
                  </div>
                ))}
              </div>

              {/* Day Column */}
              <div className="flex-1 relative h-[1536px]">
                {/* Horizontal hours lines */}
                {Array.from({ length: 24 }).map((_, hour) => (
                  <div key={hour} className="absolute left-0 right-0 h-px bg-border/10" style={{ top: `${hour * 64}px` }} />
                ))}

                {/* Render day events */}
                {events
                  .filter((e) => isEventOnDate(e, selectedDate))
                  .map((e) => {
                    const start = new Date(e.startTime)
                    const end = new Date(e.endTime)
                    const startHour = start.getHours() + start.getMinutes() / 60
                    const duration = Math.max(0.5, (end.getTime() - start.getTime()) / (1000 * 60 * 60))

                    const topOffset = startHour * 64
                    const height = duration * 64

                    return (
                      <button
                        key={e.id}
                        onClick={() => setSelectedEvent(e)}
                        className={`absolute left-4 right-4 rounded-xl p-3 shadow-lg hover:bg-brand-lighter/20 hover:border-brand-light/40 transition-all text-left flex flex-col gap-1 overflow-hidden z-10 cursor-pointer ${
                          e.isAllDay
                            ? "bg-brand text-page border border-brand"
                            : "bg-brand-subtle/80 border border-brand-light/20 text-brand-light"
                        }`}
                        style={{ top: `${e.isAllDay ? 4 : topOffset}px`, height: `${e.isAllDay ? 40 : height}px` }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-[11px] font-bold tracking-tight truncate leading-tight">{e.title}</p>
                          <span className="text-[9px] opacity-75 shrink-0 flex items-center gap-1 leading-none font-medium">
                            <Clock size={10} />
                            {e.isAllDay
                              ? "All Day"
                              : `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                          </span>
                        </div>
                        {duration >= 1 && <p className="text-[10px] opacity-75 leading-relaxed truncate">{e.description}</p>}
                      </button>
                    )
                  })}
              </div>
            </div>
          </div>
        )}

        {/* YEAR VIEW */}
        {currentHorizon === "year" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 bg-page rounded-xl">
            {Array.from({ length: 12 }).map((_, monthIdx) => {
              const year = selectedDate.getFullYear()
              const tempDate = new Date(year, monthIdx, 1)
              const monthDays = new Date(year, monthIdx + 1, 0).getDate()
              const firstDayOfWeek = tempDate.getDay()

              return (
                <div key={monthIdx} className="bg-surface/50 border border-border/30 rounded-xl p-4 flex flex-col shadow-md">
                  <h3 className="text-xs font-bold text-body tracking-wider uppercase border-b border-border/20 pb-1.5 mb-2 text-center">
                    {tempDate.toLocaleString("default", { month: "long" })}
                  </h3>

                  <div className="grid grid-cols-7 gap-y-1.5 text-center">
                    {/* Month Days Header */}
                    {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                      <span key={i} className="text-[8px] font-bold text-muted uppercase">
                        {d}
                      </span>
                    ))}

                    {/* Pre-padding */}
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                      <span key={i} />
                    ))}

                    {/* Days of month */}
                    {Array.from({ length: monthDays }).map((_, dayIdx) => {
                      const date = new Date(year, monthIdx, dayIdx + 1)
                      const dayEvents = events.filter((e) => isEventOnDate(e, date))
                      const hasEvents = dayEvents.length > 0

                      return (
                        <button
                          key={dayIdx}
                          onClick={() => {
                            setSelectedDate(date)
                            setCurrentHorizon("day")
                          }}
                          className={`text-[9px] font-bold w-5 h-5 flex items-center justify-center rounded-full mx-auto relative cursor-pointer hover:bg-brand hover:text-page transition-all ${
                            hasEvents
                              ? dayEvents.length >= 3
                                ? "bg-brand text-page shadow"
                                : "bg-brand-subtle text-brand-light border border-brand-light/30"
                              : "text-muted"
                          }`}
                        >
                          {dayIdx + 1}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ADD CALENDAR EVENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-border/50 text-muted hover:text-body hover:bg-page transition-all cursor-pointer"
            >
              <X size={14} />
            </button>

            <div className="flex items-center gap-2.5 border-b border-border/30 pb-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-brand-subtle flex items-center justify-center text-brand-light">
                <CalendarIcon size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-body">New Calendar Event</h3>
                <p className="text-[10px] text-muted">Add a coordination benchmark or meeting</p>
              </div>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-muted font-medium tracking-wider uppercase">Event Title</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Alliance Briefing Meeting"
                  className="w-full bg-page border border-border rounded-xl px-3.5 py-2.5 text-xs text-body focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all font-normal"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-muted font-medium tracking-wider uppercase">Description</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Add meeting agenda or context description..."
                  className="w-full bg-page border border-border rounded-xl px-3.5 py-2.5 text-xs text-body focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all font-normal"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-muted font-medium tracking-wider uppercase">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => {
                      setFormStartDate(e.target.value)
                      setFormEndDate(e.target.value)
                    }}
                    className="w-full bg-page border border-border rounded-xl px-3.5 py-2 text-xs text-body focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all font-normal"
                  />
                </div>
                {!formIsAllDay && (
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted font-medium tracking-wider uppercase">Start Time</label>
                    <input
                      type="time"
                      required
                      value={formStartTime}
                      onChange={(e) => setFormStartTime(e.target.value)}
                      className="w-full bg-page border border-border rounded-xl px-3.5 py-2 text-xs text-body focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all font-normal"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-muted font-medium tracking-wider uppercase">End Date</label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full bg-page border border-border rounded-xl px-3.5 py-2 text-xs text-body focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all font-normal"
                  />
                </div>
                {!formIsAllDay && (
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted font-medium tracking-wider uppercase">End Time</label>
                    <input
                      type="time"
                      required
                      value={formEndTime}
                      onChange={(e) => setFormEndTime(e.target.value)}
                      className="w-full bg-page border border-border rounded-xl px-3.5 py-2 text-xs text-body focus:outline-none focus:ring-2 focus:ring-brand/30 transition-all font-normal"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="all-day"
                  type="checkbox"
                  checked={formIsAllDay}
                  onChange={(e) => setFormIsAllDay(e.target.checked)}
                  className="rounded border-border text-brand focus:ring-brand/30 bg-page"
                />
                <label htmlFor="all-day" className="text-xs text-muted cursor-pointer font-medium select-none">
                  All day event
                </label>
              </div>

              {formError && (
                <div className="p-2.5 bg-error/10 border border-error/20 rounded-lg text-[10px] text-error font-semibold">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-border/30">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-page border border-border text-muted font-semibold text-xs rounded-xl hover:bg-surface/50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-brand text-page font-semibold text-xs px-5 py-2 rounded-xl hover:bg-brand-light active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isPending ? "Creating..." : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EVENT DETAILS POPOVER MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-border/50 text-muted hover:text-body hover:bg-page transition-all cursor-pointer"
            >
              <X size={14} />
            </button>

            <div className="flex items-center gap-2 border-b border-border/30 pb-3.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-subtle flex items-center justify-center text-brand-light">
                <CalendarIcon size={16} />
              </div>
              <h3 className="text-sm font-semibold text-body truncate max-w-[320px]">{selectedEvent.title}</h3>
            </div>

            <div className="space-y-4">
              {selectedEvent.description && (
                <div className="flex gap-2.5 items-start">
                  <AlignLeft size={14} className="text-muted mt-0.5 shrink-0" />
                  <p className="text-xs text-muted leading-relaxed whitespace-pre-wrap">{selectedEvent.description}</p>
                </div>
              )}

              <div className="flex gap-2.5 items-center">
                <Clock size={14} className="text-muted shrink-0" />
                <div className="text-xs text-body">
                  {selectedEvent.isAllDay ? (
                    <span className="font-semibold text-brand-light bg-brand-subtle/50 px-2 py-0.5 rounded border border-brand-light/10">All Day Event</span>
                  ) : (
                    <div className="flex flex-col gap-0.5">
                      <p>
                        <span className="text-muted mr-1.5 font-medium">Starts:</span>
                        {new Date(selectedEvent.startTime).toLocaleString()}
                      </p>
                      <p>
                        <span className="text-muted mr-1.5 font-medium">Ends:</span>
                        {new Date(selectedEvent.endTime).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border/30 mt-6">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 bg-page border border-border text-muted font-semibold text-xs rounded-xl hover:bg-surface/50 transition-all cursor-pointer"
                >
                  Close
                </button>
                {(isOfficer || selectedEvent.createdBy === currentUserId) && (
                  <button
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    disabled={isPending}
                    className="flex items-center gap-1.5 border border-error/20 bg-error/10 text-error font-semibold text-xs py-2 px-4 rounded-xl hover:bg-error/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 size={12} />
                    Delete Event
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
