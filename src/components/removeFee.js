import React, { Component } from 'react'
import { Page, Card, Button } from '@shopify/polaris'
import { Redirect } from 'react-router-dom'
import axios from 'axios'

export default class RemoveFee extends Component {
    state = {
        query: '',
        queryResults: [],
        customerChosen: false,
        customer: [],
        metafields: [],
        metaRemove: [],
        doRedirect: false
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
        let i = this.props.location.state.results
        // eslint-disable-next-line
        let j = i.filter(o => Object.keys(o).some(k => {if(o[k] != null){return(o[k].toLowerCase().includes(this.state.query.toLowerCase()))}}))
        this.setState({ queryResults: j})
    } 
    
    handleAction = (e) => {
        let arr = []
        arr.push(e)
        this.setState({
            customerChosen: !this.state.customerChosen,
            queryResults: [],
            customer: arr,
            metafields: []
        })
        this.search.value = ''
    }

    handleSearch = (e) => {
        axios.post(`/searchMeta`, e).then(res => {
            console.log(res.data.metafields)
            let count = 0
            for(let item in res.data.metafields) {
                if(res.data.metafields[item].namespace === 'children_names') {
                    count = count + 1
                }
            }

            let allStudents = []
            for(let i = 1; i<count+1; i++) {
                let students = []
                for(let item in res.data.metafields) {
                    const p = res.data.metafields[item]
                    let j = p.key.split('_')[0]

                    if(j === 'child' + i) {
                        if(p.namespace === 'fee') {
                            let j = this.props.location.state.productResults.filter(v => {if(v.variant_id ===  p.value){return (v.title)}})[0]
                            if(j !== undefined) {
                                p['title'] = j.title
                            }
                        }
                        students.push(p)
                    }
                }
                allStudents.push(students)
            }
            console.log('%c AllStudents', 'color: lightPink; font-weight: bold;')
            console.log(allStudents)
            this.setState({metafields: allStudents})
            
        })
    }

    getFees = (fees, metaI)  => {
        let div = []
        console.log('%c Fees', 'color: lightgreen; font-weight: bold;')
        console.log(fees)
        return fees.map((e, i) => (

            <div key = {i}>
                <div className='button-container'><div>Fee {i + 1}: <strong>{e.title}</strong></div><Button plain onClick={() => this.handleRemove(e, metaI)}>remove</Button></div>
                <div>Fee Id: {e.value}</div>
                <br />
            </div>
        ))
    }

    handleRemove = (e, metaI) => {
        let arr = this.state.metafields
        console.log(e)
        console.log(this.state.metafields)
        axios.post(`/removeMeta`, e).then(res => {
            console.log(res.data)
            arr[metaI].splice(arr[metaI].findIndex(v => v.id === e.id), 1)
            this.setState({metafields: arr})
            console.log(this.state.metafields)
        })
    }

    handleRedirect = () => {
        this.setState({ doRedirect: true})
    }
    

    render() {

        if(this.state.doRedirect) {
            return <Redirect to = {{pathname: '/'}} />
        }

        const display = this.state.queryResults.map((ep, i) => {
              return (
                <Card title={ep.first_name + " " + ep.last_name} key={i} sectioned actions={[{content: 'Select', onAction: () => this.handleAction(ep)}]}>
                  <p className='queryResults'><strong>Customer ID:</strong> {ep.id}</p>
                  <p className='queryResults'><strong>Email:</strong> {ep.email}</p>
                </Card>
              )
        })


        const displayCustomer = this.state.customer.map((ep, i) => {
            return(
                <Card key={i} title={ep.first_name + " " + ep.last_name}sectioned actions={[{content: 'Undo', onAction:this.handleAction}]}>
                  <p className='queryResults'><strong>Customer ID:</strong> {ep.id}</p>
                  <div className='button-container'><p className='queryResults'><strong>Email:</strong> {ep.email}</p><Button primary onClick={() => this.handleSearch(ep)}>Search</Button></div>
                </Card>
            )
        })
    
        const displayMetafields = this.state.metafields.map((ep, i) => {
        
            
            let name = ep.filter(student => student.namespace === 'children_names')
            let fees = ep.filter(student => student.namespace === 'fee')
            let school = ep.filter(student => student.namespace === 'children_school')
            let grade = ep.filter(student => student.namespace === 'children')
            console.log('%c Metafields', 'color: orange; font-weight: bold;')
            console.log({name, fees, school, grade})
            return(
                <Card sectioned key = {i}>
                    <div><strong>{name[0].value}</strong></div>
                    <div>School: {school[0].value}</div>
                    <div>Grade: {grade[0].value}</div>
                    <br />
                    {this.getFees(fees, i)}
                </Card>
            )


        })


        return(
            <div className='container'>
                <Page
                className='remove-page'
                fullWidth
                title='Remove Fee'
                >
                    <form>
                        <strong>Enter Parent Name/Email</strong>
                        <input
                        className="input"
                        placeholder="Search for parent..."
                        ref={input => this.search = input}
                        onChange={this.handleInputChange}  
                        disabled={this.state.customerChosen}
                        />
                    </form>
                    {this.state.customerChosen && <div className='displayFee'>{displayCustomer}</div>}
                    <div>{display}</div>
                </Page>
                <div className='remove-card'>
                    <div className='switchAddFee'><Button primary onClick={this.handleRedirect}>Add Fee</Button></div>
                    <Card sectioned title="Metafields" actions={[{content: 'Restart', onAction: this.handleAction}]}>
                        <p>
                            The results will show here after you have searched for a parent.
                        </p>
                    </Card>
                    <div>{displayMetafields}</div>
                </div>
          </div>
        )
    }
}