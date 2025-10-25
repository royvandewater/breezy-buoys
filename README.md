# breezy-buoys

## TODO

- Wake (larger when going faster)
- Pan the camera to follow the boat and allow for larger maps
- Islands
- Wind gusts
- Wind animation (without using Excalibur's particles so that we can use vector fields)
- Delivery jobs
- Sail curve animation
- Add controller support
- Fishing? (Maybe with a hunger meter)
- Better looking boat
- Waves (just appearance for now)
- Wind eddies?
- Add touch support
- Have sail area be a factor in lift & drag forces
- Remove lift force wind hits the leech of the sail before the luff
- Whip the sail around when the boat jibes

## Done

- Wind animation
- Make rudder authority a function of boat speed
- Make taking in mainsheet use the current sail position as the mainsheet amount (Taking in mainsheet should always immediately pull the sail in)
- Add in buoys to race around
- Visualize boat's current speed
- Force sail lift force to always be away from the mainsheet
- Add rotational force from wind to sail
- Control sail via mainsheet instead of direct control
- Move the mainsheet attachment point from the boat component to the sail component
  (This would allow a single boat to have multiple sails with their own attachment points)
- Add apparent wind
- Visualize wind direction
- Visualize apparent wind direction
