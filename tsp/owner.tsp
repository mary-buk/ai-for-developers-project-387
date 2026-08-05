using TypeSpec.Http;

namespace CalendarBooking.Owner;

/**
 * Owner (admin) endpoints.
 * The owner is a single predefined profile; there is no registration or authentication.
 */
interface OwnerApi {
  /** Create a new event type. */
  @route("/event-types")
  @post
  createEventType(
    @body body: CalendarBooking.EventTypeCreate,
  ): Created<CalendarBooking.EventType> | BadRequestError;

  /**
   * List all event types for the admin page.
   * Backed by the same shared read as the public catalog: GET /event-types.
   */
  @route("/event-types")
  @get
  listEventTypes(): Ok<CalendarBooking.EventType[]>;

  /** List upcoming bookings of all event types in a single list. */
  @route("/bookings")
  @get
  listUpcomingBookings(): Ok<CalendarBooking.Booking[]>;
}
