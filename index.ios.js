'use strict';

var React = require('react-native'),
    moment = require('moment'),
    qs = require('query-string'),
    cheerio = require('cheerio'),
    CalendarManager = require('NativeModules').CalendarManager;

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


var API_URL = 'https://www.clubready.com/common/widgets/ClassPublish/ajax_updateclassweek.asp';

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
        this.state = this.getInitialState();
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

    getInitialState() {
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
        var postData = qs.stringify({
                s        : 2695,
                dy       : '',
                cid      : 0,
                pb       : 1,
                cb       : 1,
                cp       : 1,
                ppbt     : '',
                cbt      : '',
                inf      : 0,
                sc       : 0,
                r        : Math.floor(Math.random() * (2282851 - 228285)) + 22825,
                dispClub : 'undefined'
            });
        
        fetch(API_URL, {
            method : 'post',
            headers : {
                'Content-Type'   : 'application/x-www-form-urlencoded',
                'Content-Length' : postData.length
            },
            body : postData
        }).then((response) => response.text()).then((responseData) => this.parseContent(responseData)).then((jsonData) => {
            var length     = jsonData.length,
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
                day = jsonData[i];
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
    parseContent(content) {
        var $ = cheerio.load(content),
            tableRows = $('>tr','#classesTable'),
            length = tableRows.length,
            schedule = [],
            classDate,
            scheduleDay,
            tableRow,
            rowCells,
            i;


        for(i = 0; i < length; i++) {
            tableRow = tableRows[i];

            if(!Object.keys(tableRow.attribs).length) {
                if(scheduleDay) {
                    schedule.push(scheduleDay);
                }

                classDate = $(tableRow).find('.accentText')[1].children[0].data;

                scheduleDay = {
                    date     : moment(classDate, 'MMM DD, YYYY').toISOString(),
                    schedule : []
                };

            }
            if(tableRow.attribs.class) {
                rowCells = $(tableRow).children('td');
                
                if(!rowCells[0].children[0].name) {
                    scheduleDay.schedule.push({
                        time       : rowCells[0].children[0].data.toUpperCase(),
                        instructor : $(rowCells[2]).text(),
                        duration   : $(rowCells[4]).text().split('\n')[0]
                    });
                } else {
                    scheduleDay.schedule.push({
                        noClasses : true
                    });
                }
                
            }
        }

        schedule.push(scheduleDay);

        return schedule;
    }


    render() {
        if (!this.state.loaded) {
            return this.renderLoadingView();
        }

        return this.renderListView();
    }

    renderLoadingView() {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>CKO Sheepshead Bay Schedule</Text>
                </View>
                
                <View style={styles.acitvityContainer}>
                    <ActivityIndicatorIOS
                        animating={!this.state.loaded}
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
                    contentInset={{top:0}}
                    automaticallyAdjustContentInsets={false}
                />
            </View>
        );
    }

    createCalendarEvent(rowData, sectionID) {
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
};

Object.assign(ClubReadyApp.prototype, {
    bindableMethods : {
        renderRow : function (rowData, sectionID, rowID) {
            var rowView = (
                    <View style={styles.rowStyle}>
                        <Text style={styles.rowText}>{rowData.time}</Text>        
                        <Text style={styles.subText}>{rowData.instructor}</Text>        
                    </View>
                );

            if(rowData.noClasses) {
                rowView = <View style={styles.rowStyle}><Text style={styles.rowText}>No Classes</Text></View>
            }

            return (
                <TouchableOpacity onPress={() => this.onPressRow(rowData, sectionID)}>
                    {rowView}
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
            !rowData.noClasses && AlertIOS.alert('Add Event To Calendar', null, buttons);
        }

    }
});

var styles = StyleSheet.create({
    container: {
        flex: 1
    },
    acitvityContainer : {
        flex : 1,
        marginTop : 10,
        flexDirection : 'row',
        alignItems: 'flex-start',
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
