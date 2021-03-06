app.controller("problemPadController", problemPadController).directive("verifyIdentifier", function($q, $timeout, $http) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attr, ctrl) {
            ctrl.$asyncValidators.verifyIdentifier = function(modelValue, viewValue) {
                var def = $q.defer();
                $http.post('/problemPad/IdentifierCheck.json', {
                    identifier: viewValue
                }).success(function(data, status, headers, config) {
                    if (data.result == true) {
                        def.resolve();
                    } else {
                        def.reject();
                    }
                });
                return def.promise;
            };
        }
    }
})

function problemPadController($scope, $http, $window, $location) {
    $scope.problemPad = {
        identifier: "",
        description: "",
        code: ""
    }

    $scope.init = function() {

        if ($location.search().identifier) {
            $http.post('/problemPad/problem/' + $location.search().identifier, {}).success(function(data, status, headers, config) {
                if (data.result) {
                    $scope.problemPad.identifier = data.identifier;
                    $scope.problemPad.description = data.description;
                    $scope.code = data.code;
                }
            });
        } else {

            $scope.code =
                '-- The function get_name() should return a single string that is the name of the puzzle.
--
function get_name()
  return "UNNAMED PUZZLE "
end

-- The function get_description() should return an array of strings, where each string is
-- a line of description for the puzzle. The text you return from get_description() will 
-- be automatically formatted and wrapped to fit inside the puzzle information box.
--
function get_description()
  return { "DESCRIPTION LINE 1 ", "DESCRIPTION LINE 2 " }
end

-- The function get_streams() should return an array of streams. Each stream is described
-- by an array with exactly four values: a STREAM_* value, a name, a position, and an array
-- of integer values between -999 and 999 inclusive.
--
-- STREAM_INPUT: An input stream containing up to 39 numerical values.
-- STREAM_OUTPUT: An output stream containing up to 39 numerical values.
-- STREAM_IMAGE: An image output stream, containing exactly 30*18 numerical values between 0
--               and 4, representing the full set of "pixels " for the target image.
--
-- NOTE: Arrays in Lua are implemented as tables (dictionaries) with integer keys that start
--       at 1 by convention. The sample code below creates an input array of 39 random values
--       and an output array that doubles all of the input values.
--
-- NOTE: To generate random values you should use math.random(). However, you SHOULD NOT seed
--       the random number generator with a new seed value, as that is how TIS-100 ensures that
--       the first test run is consistent for all users, and thus something that allows for the
--       comparison of cycle scores.
--
-- NOTE: Position values for streams should be between 0 and 3, which correspond to the far
--       left and far right of the TIS-100 segment grid. Input streams will be automatically
--       placed on the top, while output and image streams will be placed on the bottom.
--
function get_streams()
  input = {}
  output = {}
  for i = 1,39 do
    input[i] = math.random(10, 99)
    output[i] = input[i] * 2
  end
  return {
    { STREAM_INPUT, "IN.A ", 1, input },
    { STREAM_OUTPUT, "OUT.A ", 2, output },
  }
end

-- The function get_layout() should return an array of exactly 12 TILE_* values, which
-- describe the layout and type of tiles found in the puzzle.
--
-- TILE_COMPUTE: A basic execution node (node type T21).
-- TILE_MEMORY: A stack memory node (node type T30).
-- TILE_DAMAGED: A damaged execution node, which acts as an obstacle.
--
function get_layout()
  return { 
    TILE_COMPUTE,   TILE_COMPUTE, TILE_COMPUTE,   TILE_COMPUTE,
    TILE_COMPUTE,   TILE_COMPUTE, TILE_COMPUTE,   TILE_COMPUTE,
    TILE_COMPUTE,   TILE_COMPUTE, TILE_COMPUTE,   TILE_COMPUTE,
  }
end';
        }
    }

    $scope.submitProblem = function() {
        if ($scope.ProblemsPad.$valid) {

            $http.post('/problemPad/submit.json', {
                identifier: $scope.problemPad.identifier,
                description: $scope.problemPad.description,
                code: $scope.code

            }).success(function(data, status, headers, config) {
                $scope.problemPad.output = data.err;
                if (data.result) {
                    $window.location.href = "/pad/#?problem=" + $scope.problemPad.identifier;
                }
            });
        }
    }
};