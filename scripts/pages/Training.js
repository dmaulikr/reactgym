'use strict';

let React = require('react'),
    List = require('../components/List'),
    AppStateActionCreators = require('../actions/AppStateActionCreators'),
    SimpleHeaderMixin = require('../mixins/SimpleHeaderMixin'),
    TrainingStoreActionCreators = require('../actions/TrainingStoreActionCreators'),
    WorkoutStore = require('../stores/WorkoutStore'),
    _ = require('lodash'),
    TrainingForm = require('../components/forms/TrainingForm'),
    PureRenderMixin = require('react').addons.PureRenderMixin,
    StopTrainingDialog = require('../components/StopTrainingDialog'),
    TrainingStore = require('../stores/TrainingStore'),
    SettingsStore = require('../stores/SettingsStore'),
    ExerciseStore = require('../stores/ExerciseStore'),
    AppState = require('../stores/AppState');

let Training = React.createClass({
    header: {
        title: 'Training'
    },

    mixins: [SimpleHeaderMixin, PureRenderMixin],

    contextTypes: {
        router: React.PropTypes.func.isRequired
    },

    getInitialState() {
        return {
            activeTraining: AppState.getActiveTraining(),
            timer: AppState.getTimer()
        };
    },

    finishTraining() {
        let self = this,
            yesHandler = () => {
                TrainingStoreActionCreators.addTraining(AppState.getActiveTraining());
                AppStateActionCreators.finishTraining();
                AppStateActionCreators.stopTimer();
                AppStateActionCreators.closeModal();
                self.context.router.transitionTo('home');
            },
            noHandler = () => {
                AppStateActionCreators.closeModal();
            };
        AppStateActionCreators.openModal(
            <StopTrainingDialog yesHandler={yesHandler} noHandler={noHandler} />
        );
    },

    startTraining(e, item) {
        let workout = _.assign({}, item);
        let sets = workout.exercises.reduce((acc, exercise) => {
            acc[exercise] = [];
            return acc;
        }, {});
        let training = {
            workout: workout,
            id: TrainingStore.getTrainings().reduce((acc, item) => {
                return item.get('id');
            }, 0) + 1,
            sets: sets,
            dateStart: new Date(),
            currentExercise: _.first(workout.exercises)
        };
        AppStateActionCreators.startTraining(training);
    },

    exerciseClickHandler(e, item) {
        AppStateActionCreators.setCurrentExercise(item.id);
    },

    formSubmitHandler(exercise, reps, weight) {
        AppStateActionCreators.addSet(exercise, reps, weight);
        AppStateActionCreators.startTimer(SettingsStore.getRestTimer());
    },

    render() {
        let handlers = {};
        if (this.state.activeTraining === null) {
            handlers = {
                default: this.startTraining
            };
            return (
                <div className='page training'>
                    <h1>Select a Workout:</h1>
                    <List editAble={false} handlers={handlers} items={WorkoutStore.getWorkouts().toJS()} />
                </div>
            );
        }

        handlers = {
            default: this.exerciseClickHandler
        };
        let training = this.state.activeTraining,
            exercises = ExerciseStore.getExercises().filter((item) => {
                return training.getIn(['workout', 'exercises']).contains(item.get('id').toString());
            }),
            currentExercise = training.get('currentExercise').toString(),
            currentExerciseIndex = exercises.findIndex((item) => {
                return item.get('id') == currentExercise;
            });

        return (
            <div className='page training'>
                <h1>{training.getIn(['workout', 'label'])}</h1>
                <div className='timer'>
                    {this.state.timer} <i className='ion-android-time'></i>
                </div>
                <div className='scrollinglist'>
                    <List activeIndex={currentExerciseIndex}
                        editAble={false} handlers={handlers} items={exercises.toJS()} />
                </div>
                <TrainingForm exercise={currentExercise}
                    sets={training.getIn(['sets', currentExercise])} handler={this.formSubmitHandler} />
                <div className='finish' onClick={this.finishTraining}>
                    <i className='ion-trophy'></i> Finish Training
                </div>
            </div>
        );
    },

    componentDidMount() {
        let self = this;
        AppState.addChangeListener(self._onChange);
    },

    componentWillUnmount() {
        AppState.removeChangeListener(this._onChange);
    },

    _onChange() {
        this.setState({
            activeTraining: AppState.getActiveTraining(),
            timer: AppState.getTimer()
        });
    }
});

module.exports = Training;

