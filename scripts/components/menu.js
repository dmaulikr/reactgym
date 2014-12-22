'use strict';

var React = require('react'),
    MenuButton = require('../components/MenuButton'),
    { Navigation } = require('react-router');

var Menu = React.createClass({
    mixins: [Navigation],
    
    getInitialState() {
        return {
            menuPoints: [
                {
                    name: 'Home',
                    link: 'home'
                },
                {
                    name: 'Exercises',
                    link: 'exercises'
                },
                {
                    name: 'Workouts',
                    link: 'workouts'
                }
            ]
        };
    },

    render() {
        var self = this,
            menuPoints = this.state.menuPoints.map(function(item) {
            var handlerFunc = function() {
                self.props.closeHandler();
                self.transitionTo(item.link);
            };
            return <MenuButton name={item.name} handler={handlerFunc}></MenuButton>;
        });

        return (
            <div className="menu">
                {menuPoints}
            </div>
        );
    }
});

module.exports = Menu;

