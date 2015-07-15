app.controller("PadController", PadController);


function PadController($scope, $http) {

    $scope.STATE = {
        EXEC: 0,
        STCK: 1,
        ERR: 3
    }
    $scope.nodes = [
        [{
            state: $scope.STATE.EXEC,
            text: ""
        }, {
            state: $scope.STATE.EXEC,
            text: ""
        }, {
            state: $scope.STATE.EXEC,
            text: ""
        }, {
            state: $scope.STATE.EXEC,
            text: ""
        }],
        [{
            state: $scope.STATE.EXEC,
            text: ""
        }, {
            state: $scope.STATE.EXEC,
            text: ""
        }, {
            state: $scope.STATE.EXEC,
            text: ""
        }, {
            state: $scope.STATE.EXEC,
            text: ""
        }],
        [{
            state: $scope.STATE.EXEC,
            text: ""
        }, {
            state: $scope.STATE.EXEC,
            text: ""
        }, {
            state: $scope.STATE.EXEC,
            text: ""
        }, {
            state: $scope.STATE.EXEC,
            text: "resawefawe"
        }]
    ]


    $scope.getClass = function(node) {
        if (node) {
            if (node.state === $scope.STATE.EXEC) {
                return "execnode";
            }
            if (node.state === $scope.STATE.STCK) {
                return "stcknode";
            }
            if (node.state === $scope.STATE.ERR) {
                return "errnode";
            }
        }

    }

    $scope.setState = function(node, state) {
        node.state = state;
    }

    $scope.save = function() {
        $http.post('/save', {
            nodes: $scope.nodes
        }).
        success(function(data, status, headers, config) {}).
        error(function(data, status, headers, config) {

        });
    }

    $scope.download = function() {

    }

    $scope.upload_save = function() {

    }

    $scope.new_solution = function() {

    }

}

function resize() {
    $(".node").each(function(index) {
        var w = $(this).width();
        $(this).find(".node-block").each(function() {
            $(this).height(w);
        });
    });
}


app.directive('resize', function($window) {
    return function(scope, element) {
        var w = angular.element($window);
        scope.$watch(function() {
            return {
                'h': w.height(),
                'w': w.width()
            };
        }, function(newValue, oldValue) {
            resize();
        }, true);

        w.bind('resize', function() {
            scope.$apply();
        });
    }
});

window.onload = function() {
    resize();
}