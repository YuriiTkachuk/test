import React from 'react';
import './app.scss';
import json from './clients.json';
import Geocode from 'react-geocode';
import {Gmaps, Marker} from 'react-gmaps';

const api = "AIzaSyAR3ZusMJ8YPkAkbnsh8cXVBuzWJ7Sk3C0";
Geocode.setApiKey(api);
const params = {v: '3.exp', key: api};
const customers = json.Customers;
const counter = (arr) => {
  return arr.reduce(function (p, c) { p[c] = (p[c] || 0) + 1; return p }, {})
};

const countries = counter(customers.map(w => w.Country));
const sortCountries = Object.entries(countries).sort((a,b) => b[1] - a[1]).map(w => w[0]);
let cities = counter(customers.filter(w => w.Country === sortCountries[0]).map(w => w.City));
let sortCities = Object.entries(cities).sort((a,b) => b[1] - a[1]).map(w => w[0]);
let sortCompany = customers.filter(w => w.Country === sortCountries[0] && w.City === sortCities[0]).map(w => w.CompanyName).sort();

console.log(sortCompany)


export class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            lat: 0,
            lng: 0,
            country: sortCountries[0],
            city: sortCities[0],
            company: sortCompany[0],
        };
    }

    componentDidMount() {
        const { country, city, company } = this.state;
        const address = customers.filter(w => w.CompanyName === company && w.City === city && w.Country === country)[0]['Address']
        Geocode.fromAddress(`${city} ${address}`).then(
            response => {
                this.setState({
                    lat: response.results[0].geometry.location.lat,
                    lng: response.results[0].geometry.location.lng,
                })
            },
            error => {
                console.error(error);
            }
        );
    };

    componentDidUpdate(prevProps, prevState) {
        const { country, city, company } = this.state;
        console.log(prevState)
        if (country !== prevState.country) {
            this.setState({
                city: sortCities[0],
            })
        }
        if (company !== prevState.company) {
            const address = customers.filter(w => w.CompanyName === company && w.City === city && w.Country === country)[0]['Address']
            console.log(address)
            Geocode.fromAddress(`${city}, ${address}`).then(
                response => {
                    this.setState({
                        lat: response.results[0].geometry.location.lat,
                        lng: response.results[0].geometry.location.lng,
                    })
                },
                error => {
                    console.error(error);
                }
            );
        }
    };

    onMapCreated(map) {
        map.setOptions({
            disableDefaultUI: true
        });
    }

    handleClick = (e, name) => {
        e.persist();

        this.setState({
            [name]: e.target.textContent,
        });
    };

    render() {
        const { lat, lng, country, city, company } = this.state;
        cities = counter(customers.filter(w => w.Country === country).map(w => w.City));
        sortCities = Object.entries(cities).sort((a,b) => b[1] - a[1]).map(w => w[0]);
        sortCompany = customers.filter(w => w.Country === country && w.City === city).map(w => w.CompanyName).sort();
        return (
            <div className="container">
                <div className="content">
                    <div className="col">
                        {sortCountries.map((c, i) => <span key={i} className={c === country ? 'active' : ''} onClick={(e) => this.handleClick(e, 'country')}>{c}</span>)}
                    </div>
                    <div className="col">
                        {sortCities.map((c, i) => <span key={i} className={c === city ? 'active' : ''} onClick={(e) => this.handleClick(e, 'city')}>{c}</span>)}
                    </div>
                    <div className="col">
                        {sortCompany.map((c, i) => <span key={i} className={c === company ? 'active' : ''} onClick={(e) => this.handleClick(e, 'company')}>{c}</span>)}
                    </div>
                    <Gmaps
                      width={'300px'}
                      height={'400px'}
                      lat={lat}
                      lng={lng}
                      zoom={12}
                      params={params}
                      onMapCreated={this.onMapCreated}>
                          <Marker
                            lat={lat}
                            lng={lng}
                            draggable={true} />
                    </Gmaps>
                  </div>
            </div>
        );
    }

};
