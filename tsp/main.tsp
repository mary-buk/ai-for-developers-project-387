import "@typespec/http";
import "./models.tsp";
import "./owner.tsp";
import "./guest.tsp";

using TypeSpec.Http;

/** Calendar booking service. */
@service({
  title: "Calendar Booking",
  version: "1.0.0",
  description:
    "Slot booking calendar. Owner manages event types and views upcoming bookings; guests book free slots without an account.",
})
@server("http://localhost:3000", "Local development server")
namespace CalendarBooking;
