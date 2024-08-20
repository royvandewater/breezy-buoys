# breezy-buoys


## TODO

* Make rudder authority a function of boat speed
* Track laps
* Track lap time
* Penalize hitting buoys
* Add controller support
* Add touch support
* Pan the camera to follow the boat and allow for larger maps
* Have sail area be a factor in lift & drag forces
* Remove lift force wind hits the leech of the sail before the luff
* Whip the sail around when the boat jibes

## Done

* Make taking in mainsheet use the current sail position as the mainsheet amount (Taking in mainsheet should always immediately pull the sail in)
* Add in buoys to race around
* Visualize boat's current speed
* Force sail lift force to always be away from the mainsheet
* Add rotational force from wind to sail
* Control sail via mainsheet instead of direct control
* Move the mainsheet attachment point from the boat component to the sail component
  (This would allow a single boat to have multiple sails with their own attachment points)
* Add apparent wind
* Visualize wind direction
* Visualize apparent wind direction
