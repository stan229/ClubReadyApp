'use strict';

var React = require('react-native');
var moment = require('moment');
var CalendarManager = require('NativeModules').CalendarManager;

var {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    ListView,
    TouchableOpacity,
    AlertIOS,
    ActivityIndicatorIOS
} = React;


var API_URL = 'https://agile-reef-2525.herokuapp.com/schedule';

moment.locale('en', {
    calendar : {
        lastDay : '[Yesterday]',
        sameDay : '[Today]',
        nextDay : '[Tomorrow]',
        lastWeek : 'MMM DD YYYY',
        nextWeek : 'MMM DD YYYY',
        sameElse : 'MMM DD YYYY'
    }
});



class ClubReadyApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getState();
        this.bindMethods();
    }
    
    bindMethods() {
        if (! this.bindableMethods) {
            return;
        }   

        for (var methodName in this.bindableMethods) {
            this[methodName] = this.bindableMethods[methodName].bind(this);
        }
    }

    getState() {
        var getSectionData = (dataBlob, sectionID) => {
            return dataBlob[sectionID];
        }

        var getRowData = (dataBlob, sectionID, rowID) => {
            return dataBlob[sectionID + ',' + rowID];
        }

        return {
            loaded: false,
            dataSource: new ListView.DataSource({
                getSectionData: getSectionData,
                getRowData: getRowData,
                rowHasChanged: (row1, row2) => row1 !== row2,
                sectionHeaderHasChanged: (s1, s2) => s1 !== s2
            })
        }
    }
    componentDidMount() {
        this.fetchData();
    }

    fetchData() {
        fetch(API_URL).then((response) => response.json()).then((responseData) => {
            var length     = responseData.length,
                dataBlob   = {},
                sectionIDs = [],
                rowIDs     = [],
                daySchedule,
                scheduleLength,
                session,
                day,
                date,
                parsedDate,
                i,
                j;


            for (i = 0; i < length; i++) {
                day = responseData[i];
                date = day.date;
                sectionIDs.push(date);
                
                parsedDate = moment(day.date).calendar();
                dataBlob[date] = parsedDate;

                daySchedule = day.schedule;
                scheduleLength = daySchedule.length;

                rowIDs[i] = [];

                for (j = 0; j < scheduleLength; j++) {
                    session = daySchedule[j];
                    rowIDs[i].push(j);
                
                    dataBlob[date + ',' + j] = session;
                }
            }

            this.setState({
                dataSource : this.state.dataSource.cloneWithRowsAndSections(dataBlob, sectionIDs, rowIDs),
                loaded     : true
            });
        }).done();
    }


    render() {
        if (!this.state.loaded) {
            return this.renderLoadingView();
        }

        return this.renderListView();
    }

    renderLoadingView() {
        return (
            <View style={styles.header}>
                <Text style={styles.headerText}>CKO Sheepshead Bay Schedule</Text>
                <View style={styles.container}>
                    <ActivityIndicatorIOS
                        animating={!this.state.loaded}
                        style={[styles.activityIndicator, {height: 80}]}
                        size="large"
                    />
                </View>
            </View>
        );
    }

    renderListView() {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>CKO Sheepshead Bay Schedule</Text>
                </View>
                <ListView
                    dataSource = {this.state.dataSource}
                    style      = {styles.listview}
                    renderRow  = {this.renderRow}
                    renderSectionHeader = {this.renderSectionHeader}
                />
            </View>
        );
    }

  
    // onPressRow(rowData, sectionID) {
    //     var buttons = [
    //         {
    //             text : 'Cancel'
    //         },
    //         {
    //             text    : 'OK',
    //             onPress : this.createCalendarEvent.bind(this, rowData, sectionID)
    //         }
    //     ]
    //     AlertIOS.alert('Add Event To Calendar', null, buttons);
    // }

    createCalendarEvent(rowData, sectionID) {
        debugger;
        var dateString = moment(sectionID).format('L') + ' ' + rowData.time,
            classDate = moment(dateString, 'MM/DD/YYYY h:mm A');


        CalendarManager.addEvent('CKO Class', classDate.toISOString(), '2615 E 17th St, Brooklyn, NY 11235', rowData.instructor);
    }

    renderSectionHeader(sectionData, sectionID) {
        return (
            <View style={styles.section}>
                <Text style={styles.text}>{sectionData}</Text>
            </View>
        ); 
    }

    renderHeader() {
        <View style={styles.header}>
          <Text>CKO Sheepsheadbay Schedule</Text>
        </View>
    }
};

Object.assign(ClubReadyApp.prototype, {
    bindableMethods : {
        renderRow : function (rowData, sectionID, rowID) {
            return (
                <TouchableOpacity onPress={() => this.onPressRow(rowData, sectionID)}>
                    <View style={styles.rowStyle}>
                        <Text style={styles.rowText}>{rowData.time}</Text>        
                        <Text style={styles.subText}>{rowData.instructor}</Text>        
                    </View>
                </TouchableOpacity>
            );
        },
        onPressRow : function (rowData, sectionID) {
            var buttons = [
                {
                    text : 'Cancel'
                },
                {
                    text    : 'OK',
                    onPress : () => this.createCalendarEvent(rowData, sectionID)
                }
            ]
            AlertIOS.alert('Add Event To Calendar', null, buttons);
        }

    }
});

var styles = StyleSheet.create({
    container: {
        flex: 1
    },
    activityIndicator: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#3F51B5',
        flexDirection: 'column',
        paddingTop: 25
    },
    headerText: {
        fontWeight: 'bold',
        fontSize: 20,
        color: 'white'
    },
    text: {
        color: 'white',
        paddingHorizontal: 8,
        fontSize: 16
    },
    rowStyle: {
        paddingVertical: 20,
        paddingLeft: 16,
        borderTopColor: 'white',
        borderLeftColor: 'white',
        borderRightColor: 'white',
        borderBottomColor: '#E0E0E0',
        borderWidth: 1
    },
    rowText: {
        color: '#212121',
        fontSize: 16
    },
    subText: {
        fontSize: 14,
        color: '#757575'
    },
    section: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: 6,
        backgroundColor: '#2196F3'
    }
});

AppRegistry.registerComponent('ClubReadyApp', () => ClubReadyApp);

module.exports = ClubReadyApp;
