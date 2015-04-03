{
    init: function(elevators, floors) {
        var sortAsc = function(a, b) { return a - b; };
        var sortDesc = function(a, b) { return b - a; };
        var maxFloor = floors.length;
        var minFloor = 0;
        var downQueue = [];
        var upQueue = [];
        
        var turnOffElevatorLights = function (elevator) {
            elevator.goingUpIndicator(false);
            elevator.goingDownIndicator(false);
        }
        
        var turnOnElevatorUpLight = function (elevator) {
            elevator.goingUpIndicator(true);
            elevator.goingDownIndicator(false);
        }
        
        var turnOnElevatorDownLight = function (elevator) {
            elevator.goingUpIndicator(false);
            elevator.goingDownIndicator(true);
        }
        
        var isGroundFloor = function (floorNum) {
            return floorNum === minFloor;
        }
        
        var isLastFloor = function (floorNum) {
            return floorNum === maxFloor;
        }
        
        var isElevatorEmpty = function (elevator) {
            return elevator.loadFactor() === 0;
        }
        
        var nextElevatorDirection = function (currentFloor) {
            var nextFloorUp = 0;
            for (var i = currentFloor; i < maxFloor; i++) {
                if (_.contains(downQueue, i)) {
                    nextFloorUp = i;
                    break;
                }
            }
            var nextFloorDown = 0;
            for (var i = currentFloor; i > minFloor; i--) {
                if (_.contains(downQueue, i)) {
                    nextFloorDown = i;
                    break;
                }
            }
            if (nextFloorUp - currentFloor < nextFloorDown - currentFloor) 
                return nextFloorUp;
            else 
                return nextFloorDown;
        }

        elevators.forEach(function(elevator) {
            elevator.on("floor_button_pressed", function(floorNum) {
                elevator.goToFloor(floorNum);
            });

            elevator.on("passing_floor", function(floorNum, direction) {
                if (direction === "up") {
                    elevator.goingUpIndicator(true);
                    elevator.goingDownIndicator(false);
                    if (upQueue.indexOf(floorNum) !== -1 && elevator.loadFactor() !== 1) {
                        elevator.goToFloor(floorNum, true);
                        _.filter(upQueue, function(v) { return v === floorNum});
                    }
                } else {
                    elevator.goingDownIndicator(true);
                    elevator.goingUpIndicator(false);
                    if (downQueue.indexOf(floorNum) !== -1 && elevator.loadFactor() !== 1) {
                        elevator.goToFloor(floorNum, true);
                        _.filter(downQueue, function(v) { return v === floorNum});
                    }
                }
            });
            
            elevator.on("stopped_at_floor", function(floorNum) {
                if (isElevatorEmpty(elevator)) {
                    turnOffElevatorLights(elevator);
                    var nextFloor = nextElevatorDirection(floorNum);
                    elevator.goToFloor(nextFloor);
                }

                if (isGroundFloor(floorNum)) 
                    turnOnElevatorUpLight(elevator);

                if (isLastFloor(floorNum)) 
                    turnOnElevatorDownLight(elevator);
                
            });
            
            elevator.on("idle", function(floorNum) {
                elevator.goToFloor(0);
            });
        });
        
        floors.forEach(function(floor) {
            floor.on("up_button_pressed", function () {
                upQueue.push(floor.floorNum());
            });
            floor.on("down_button_pressed", function() {
                downQueue.push(floor.floorNum());
            });
        });        
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}
