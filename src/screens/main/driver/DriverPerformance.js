import React, { Component } from 'react';
import { connect } from 'react-redux';
import { TouchableOpacity, Dimensions } from 'react-native';
import { Button, Container, Content, Text, Icon, View, Input, Item } from 'native-base';
import { DataTable } from 'react-native-paper';
// import DatePicker from 'react-native-date-picker';
import DatePicker from 'react-native-datepicker';
import Moment from 'moment';

import { getDriverPerformance } from '../../../actions/schedule';


// const columns = ['DATE', 'ROUTE', 'DRIVER', 'TYPE'];
const { width, height } = Dimensions.get('window');
let isDateFilter = false;

class DriverPerformance extends Component {
  state = {
    performanceData: null,
    totalCount: 0,
    page: 1,
    numPerPage: 10,
    optionsPerPage: [5, 10, 20],
    fromDate: new Date(),
    endDate: new Date(),
  };

  componentDidMount() {
    this.getMonthlyListByDriver();
  }

  getMonthlyListByDriver = async () => {
    const { userData } = this.props.auth;
    const { page, numPerPage, fromDate, endDate } = this.state;
    const params = {
      conditions: { is_date_filter: isDateFilter, driver_id: userData.id },
      descending: true,
      endDate: Moment(endDate, 'DD/MM/YY ddd').format('YYYY-MM-DD'),
      fromDate: Moment(fromDate, 'DD/MM/YY ddd').format('YYYY-MM-DD'),
      numPerPage: numPerPage,
      sortBy: "report_date",
      start: (page - 1) * numPerPage
    }
    getDriverPerformance(params, async (data) => {
      try {
        this.setState({ performanceData: data.data, totalCount: data.totalCount });
      } catch (error) {
        console.log('eeeeeeeeee', error);
      }
    })
  }
  changeDateFormat(reportDate) {
    const convertedDate = Moment(reportDate, 'YYYY-MM-DD').add(5, 'hours').format('DD-MM-YY dddd');
    return convertedDate;
  }
  setPage = async (page) => {
    if (page > 0) {
      await this.setState({ page: page });
      await this.getMonthlyListByDriver();
    }
  }
  setDate = async (date, pos) => {
    isDateFilter = true;
    await this.setPage(1);
    if (pos == 'from') {
      await this.setState({ fromDate: date });
    } else if (pos == 'end') {
      await this.setState({ endDate: date });
    }
    await this.getMonthlyListByDriver();
  }

  render() {
    const { performanceData, totalCount } = this.state;
    const { page, numPerPage, optionsPerPage, fromDate, endDate } = this.state;
    return (
      <Container>
        <Content padder>
          {performanceData ? (
            <>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <DatePicker
                  style={{width: 160}}
                  date={fromDate}
                  mode="date"
                  placeholder="select date"
                  format="DD/MM/YY ddd"
                  confirmBtnText="Ok"
                  cancelBtnText="Cancel"
                  customStyles={{
                    dateInput: {
                      borderWidth: 0,
                      borderBottomWidth: 1
                    }
                  }}
                  onDateChange={(date) => {this.setDate(date, 'from')}}
                />
                <DatePicker
                  style={{width: 160}}
                  date={endDate}
                  mode="date"
                  placeholder="select date"
                  format="DD/MM/YY ddd"
                  confirmBtnText="Ok"
                  cancelBtnText="Cancel"
                  customStyles={{
                    dateInput: {
                      borderWidth: 0,
                      borderBottomWidth: 1
                    }
                  }}
                  onDateChange={(date) => {this.setDate(date, 'end')}}
                />
              </View>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title style={{ flex: 3, paddingHorizontal: 2 }}>DATE</DataTable.Title>
                  <DataTable.Title style={{ flex: 2, paddingHorizontal: 2 }}>ROUTE</DataTable.Title>
                  <DataTable.Title style={{ flex: 2, paddingHorizontal: 2 }}>PAYMENT</DataTable.Title>
                  {/* <DataTable.Title style={{ paddingHorizontal: 2 }}>TYPE</DataTable.Title> */}
                </DataTable.Header>

                {performanceData.map(data => (
                  <DataTable.Row key={data.id} style={{minHeight: 45}}>
                    <DataTable.Cell style={{ flex: 3, paddingHorizontal: 2 }}>{this.changeDateFormat(data.report_date)}</DataTable.Cell>
                    <DataTable.Cell style={{ flex: 2, paddingHorizontal: 2 }}>{data.route_number}</DataTable.Cell>
                    <DataTable.Cell style={{ flex: 2, paddingHorizontal: 2 }}>{data.pay_amount}</DataTable.Cell>
                    {/* <DataTable.Cell style={{ flex: 2, paddingHorizontal: 2 }}>{data.is_group === 1 ? 'DAILY' : 'EXTRA'}</DataTable.Cell> */}
                  </DataTable.Row>
                ))}

                <DataTable.Pagination
                  page={page}
                  numberOfPages={3}
                  onPageChange={(page) => this.setPage(page)}
                  label={((page-1)*numPerPage+1) + '-' + ((page-1)*numPerPage+performanceData.length) + ' of ' + totalCount}
                  optionsPerPage={optionsPerPage}
                  itemsPerPage={numPerPage}
                  setItemsPerPage={(num) => { this.setState({ numPerPage: num }) }}
                  showFastPagination
                  optionsLabel={'Rows per page'}
                />
                </DataTable>
              </>
          ) : null}
        </Content>
      </Container>
    );
  }
}

function mapStateToProps({ auth, state }) {
  return {
    auth,
    state,
  };
}

const bindActions = {
  getDriverPerformance
};

export default connect(mapStateToProps, bindActions)(DriverPerformance);
