using TypeSpec.Http;

namespace CalendarBooking.Guest;

/**
 * Public (guest) endpoints.
 * Guests browse event types and book free slots without creating an account or logging in.
 */
interface GuestApi {
  /** List event types for the public page (title, description, duration). Shared with the owner admin page. */
  @route("/event-types")
  @get
  listEventTypes(): Ok<CalendarBooking.EventType[]>;

  /**
   * Free slots for one day. The date must be within the 14-day booking window
   * (from the current date up to +13 days). Slots outside the window or in the past are not offered.
   */
  @route("/event-types/{eventTypeId}/slots")
  @get
  listSlots(
    @path eventTypeId: string,
    @query date: plainDate,
  ): Ok<CalendarBooking.Slot[]> | NotFoundError | BadRequestError;

  /**
   * Create a booking for a free slot.
   * The busy rule is global: a slot cannot be double-booked even by different event types,
   * so an already taken slot is rejected with 409.
   */
  @route("/bookings")
  @post
  createBooking(
    @body body: CalendarBooking.BookingCreate,
  ): Created<CalendarBooking.Booking> | BadRequestError | ConflictError;
}
