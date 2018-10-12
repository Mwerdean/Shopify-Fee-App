import React, { Component } from 'react'
import { Page, Card, Button, Spinner, Select } from '@shopify/polaris'
import { Redirect } from 'react-router-dom'
import axios from 'axios'
import '../App.css'

class AddFee extends Component {
  state = {
    query: '',
    results: [],
    queryResults: [],
    customerList: [],
    pagination: 1,
    pagination2: 1,
    productResults: [],
    feeChosen: false,
    fee: [],
    isLoading: false,
    sentStudents: false,
    selected: 'All',
    students: [],
    shipped: [],
    progress: 0,
    restart: false,
    doRedirect: false,
    qtys: [],
    qtyButton: false
  }
  
  componentDidMount(){
    axios.get(`/database`).then(res => {
      console.log(res.data)
      this.setState({ 
        results: res.data[0].recordset,
        productResults: res.data[1].recordset
      })
    })
  }

  handleInputChange = () => {
    this.setState({
      query: this.search.value
    }, () => {
      if(this.state.query && this.state.query.length > 2) {
        if(this.state.query.length % 1 === 0) {
          this.getInfo()
        }
      }
    })
  }


  getInfo = () => {
    let i
    if(this.state.pagination === 1){
      i = this.state.results
    } else {
      i = this.state.productResults
    }
    // eslint-disable-next-line
    let j = i.filter(o => Object.keys(o).some(k => {if(o[k] != null){return(o[k].toLowerCase().includes(this.state.query.toLowerCase()))}}))
    this.setState({ queryResults: j})
  } 

  handleAction = (e) => {
    let arr = this.state.customerList
    arr.push(e)
    this.setState({ customerList: arr})
    console.log(this.state.customerList)
  }

  handleProductAction = (e) => {
    let arr = []
    arr.push(e)
    this.setState({ 
      feeChosen: !this.state.feeChosen,
      queryResults: [],
      fee: arr,
    })
    this.search.value = ''
  }

  handleRemove = (e, i) => {
    let arr = this.state.customerList
    console.log(e)
    arr.splice(i, 1)
    this.setState({customerList: arr})
  }

  handlePageChange = () => {
    if(this.state.pagination === 1) {
      this.setState({ pagination: 2, queryResults: [] })
    } else {
      this.setState({ pagination: 1, queryResults: [] })
    }
  }

  handlePage2Change = () => {
    if(this.state.pagination2 === 1) {
      this.setState({ pagination2: 2 })
    } else {
      this.setState({ pagination2: 1 })
    }
  }

  handleSubmitStudents = () => {
    this.setState({ isLoading: true })
    const obj = {
      product: this.state.fee,
      customers: this.state.customerList
    }

    axios.post(`/sendStudents`, obj).then(res => {
      console.log('sendStudents Data:', res.data)
      this.setState({ isLoading: !this.state.isLoading, sentStudents: true, queryResults: [], pagination2: 2, students: res.data})
    })
  }
  
  handleSelectChange = (newValue) => {
    this.setState({ selected: newValue })
  }

  selectOptions = () => {
    let options = [{label:'All', value: 'All'}]
    let unique = [...new Set(this.state.productResults.map(item => item['vendor']))]
    unique.sort()
    for(let i=0;i<unique.length; i++) {
      options.push({label: unique[i], value: unique[i]})
    }
    return options
  }

  handleToggle = (ep, i) => {
    let arr = this.state.shipped
    let isTrue = false
    let position = null
    let newEp = ep
    newEp['id'] = i
    for(let k = 0; k<arr.length; k++) {
      if(arr[k] === newEp) {
        isTrue = true
        position = k
      }
    }

    if(isTrue) {
      arr.splice(position, 1)
    } else {
      arr.push(newEp)
    }
    this.setState({ shipped: arr })
    console.log(this.state.shipped)
  }

  submitFee = () => {
    this.setState({ sentStudents: false, isLoading: true })
    const obj = {
      product: this.state.fee,
      customers: this.state.customerList,
      shipped: this.state.shipped,
      qtys: this.state.qtys
    }
    axios.post(`/submitFee`, obj).then(res => {
      console.log(res.data)
    this.setState({isLoading: false, restart: true})

    })
    // let int = setInterval(() => {
    //   if(this.state.progress >= 100) {
    //     clearInterval(int)
    //   } else {
    //     this.setState({progress: this.state.progress + 10})
    //   }
    // }, 500)
  }

  continue = () => {
    this.setState({
      query: '',
      queryResults: [],
      customerList: [],
      pagination: 1,
      pagination2: 1,
      feeChosen: false,
      fee: [],
      isLoading: false,
      sentStudents: false,
      selected: 'All',
      students: [],
      shipped: [],
      progress: 0,
      restart: false,
      qtys: [],
      qtyButton: false
    })
  }

  handleRedirect = () => {
      this.setState({ doRedirect: true })
  }

  handleQtyChange = (e, i) => {
    let qty = this.state.qtys
    console.log(e.target.value)
    qty[i].value = e.target.value
    this.setState({qtys: qty}, () => console.log(this.state.qtys))
  }

  handleAddQty = () => {
    let qty = []

    let count = this.state.students.length
    console.log('count', count)
    for(let i=0;i<count; i++) {
        qty.push({id: i, value: '1'})
    }
    this.setState({qtys: qty, qtyButton: !this.state.qtyButton})
  }


  render() {

    if(this.state.doRedirect) {
        return <Redirect to={{pathname: '/removefee', state: {results: this.state.results, productResults: this.state.productResults}}} />
    };

    // eslint-disable-next-line
    const display = this.state.queryResults.map((ep, i) => {
      if(this.state.pagination === 1) {
        return (
          <Card title={ep.first_name + " " + ep.last_name} key={i} sectioned actions={[{content: 'Add to list', onAction: () => this.handleAction(ep)}]}>
            <p className='queryResults'><strong>Customer ID:</strong> {ep.id}</p>
            <p className='queryResults'><strong>Email:</strong> {ep.email}</p>
          </Card>
        )
      } else {
          if(ep.vendor === this.state.selected || this.state.selected === 'All') {
            return (
              <Card title={ep.title} key={i} sectioned>
                <p className='queryResults'><strong>Variant ID:</strong> {ep.id}</p>
                <p className='queryResults'><strong>Price:</strong> {ep.price}</p>
                <p className='queryResults'><strong>School:</strong> {ep.vendor}</p>
                <p className='queryResults'><strong>Product Type:</strong> {ep.product_type}</p>
                <div className = 'chooseFee'><button type="button" className='Polaris-Button Polaris-Button--plain' onClick={() => this.handleProductAction(ep)}><span className="Polaris-Button__Content">Add Fee</span></button></div>
              </Card>
            )
          }
      }
    })

    const displayFee = this.state.fee.map((ep, i) => {
      return(
        <Card title={ep.title} key={i} sectioned>
          <p className='queryResults'><strong>Variant ID:</strong> {ep.id}</p>
          <p className='queryResults'><strong>Price:</strong> {ep.price}</p>
          <p className='queryResults'><strong>School:</strong> {ep.vendor}</p>
          <p className='queryResults'><strong>Product Type:</strong> {ep.product_type}</p>
          <div className='chooseFee'><button type="button" className='Polaris-Button Polaris-Button--plain' onClick={() => this.handleProductAction(ep)}><span className="Polaris-Button__Content">Remove Fee</span></button></div>
          <div>This product will be added to all parents on the list</div>
        </Card>
      )
    })

    const displayList = this.state.customerList.map((ep, i) => {
      return(
        <Card.Section key={i}>
          <div>
            <div className='button-container'><p>{ep.first_name + " " + ep.last_name}</p><button type="button" className='Polaris-Button Polaris-Button--plain' onClick={() => this.handleRemove(ep)}><span className="Polaris-Button__Content">remove</span></button></div>
            <div className='button-container'>{ep.email}</div>
          </div>
        </Card.Section>
      )
    })
    // eslint-disable-next-line
    const displayStudents = this.state.students.map((ep, i) => {
      for(let item in this.state.customerList) {
        if(parseInt(this.state.customerList[item].id, 10) === ep.owner_id) {
          return (
            <Card.Section key={i}>
              <div className='button-container'>
                <div>
                  <div>Parent:</div>
                  <div>Student:</div>
                </div>
                <div>
                  <div><p>{this.state.customerList[item].full_name}</p></div>
                  <div><strong>{ep.child_name}</strong></div>
                </div>
                  {this.state.qtyButton &&<input type='number' placeholder='1' className='qty-input' value={this.state.qtys[i].value} onChange={e => this.handleQtyChange(e, i)}/>}
                <div>
                  <input  type="checkbox" className="check check2" onClick={() => this.handleToggle(ep, i)}/>
                </div>
              </div>
            </Card.Section>
          )
        }
      }
    })



    return (


      <div className='app'>
        <div className='container'>
          {this.state.pagination === 1 &&
            <Page
              fullWidth
              title='Add Fee'
            >
              <form>
                <strong>Enter Parent Name/Email</strong>
                <input
                  className="input"
                  placeholder="Search for parent..."
                  ref={input => this.search = input}
                  onChange={this.handleInputChange}  
                />
                {this.state.feeChosen && <div className='displayFee'>{displayFee}</div>}
                <div>{display}</div>
              </form>
            </Page>
          }



          {this.state.pagination === 2 &&
            <Page
              fullWidth
              title='Add Fee'
            >
              <form>
                <strong>Enter Product/Fee Title</strong>
                <input
                  className="input"
                  placeholder="Search for product..."
                  ref={input => this.search = input}
                  onChange={this.handleInputChange}
                  disabled={this.state.feeChosen}  
                />
                <Select
                  label = "Sort by"
                  labelInline
                  options={this.selectOptions()}
                  onChange={this.handleSelectChange}
                  value={this.state.selected}
                />
                {this.state.feeChosen && <div className='displayFee'>{displayFee}</div>}
                <div className='displayFee'>{display}</div>
              </form>
            </Page>
          }


          {this.state.pagination2 === 1 && 
          <Page
            fullWidth
            title=' '
            primaryAction={{content: 'Check/Remove Fee', onAction: this.handleRedirect}}
          >
            <div className="rightCard">
              <Card title="Parent List">
                <Card.Section>
                    <p className='button-container'>Below is a list of parents that will get fee's added. <button type="button" className='Polaris-Button Polaris-Button--plain' onClick={this.continue}><span className="Polaris-Button__Content">Restart</span></button></p>
                </Card.Section>

                {displayList}

                {!this.state.isLoading && <div className={`chooseFee ${this.state.feeChosen ? 'space' : ''}`}>
                  {this.state.customerList.length > 0 && this.state.pagination === 1 && <Button size="slim" onClick={this.handlePageChange}>Choose Fee</Button>}
                  {this.state.pagination === 2 && <Button size="slim" onClick={this.handlePageChange}>Choose Parent</Button>}
                  {this.state.feeChosen && <Button primary onClick={this.handleSubmitStudents}>Get Students</Button>}
                </div>}
                {this.state.isLoading && <div className='sendFeeButton'><p>Getting Students...</p><Spinner size='small' color='teal' /></div>}
              </Card>
            </div>
          </Page>}




          {this.state.pagination2 === 2 && 
          <Page
            fullWidth
            title=' '
            primaryAction={{content: 'Check/Remove Fee', onAction: this.handleRedirect}}
          >
            <div className="rightCard">
              <Card title="Student List">
                <Card.Section>
                  <p className='button-container'>Please select the students to apply the fee to. <button type="button" className='Polaris-Button Polaris-Button--plain' onClick={this.continue}><span className="Polaris-Button__Content">Restart</span></button></p>
                </Card.Section>
                {!this.state.qtyButton && <div className='chooseFee'><button className='Polaris-Button Polaris-Button--plain' onClick={this.handleAddQty}>Change Quantities</button></div>}
                {displayStudents}
                {this.state.sentStudents && <div className='sendFeeButton'><Button primary onClick={this.submitFee}>Send Fee</Button></div>}
                {this.state.isLoading && <div className='sendFeeButton'><p>Attaching Fees...</p><Spinner size='small' color='teal' /></div>}
                {this.state.restart && <div><div className='sendFeeButton'>Fees attached!</div><div className='sendFeeButton'><Button primary onClick={this.continue}>Continue</Button></div></div>}
              </Card>
            </div>
          </Page>}
        </div>
      </div>
    );
  }
}

export default AddFee;
