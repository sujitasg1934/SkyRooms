import React, { useState, useEffect } from 'react'
import axios from 'axios';
import Loader from '../components/Loader';
import Error from '../components/Error';
import moment from 'moment';
import StripeCheckout from 'react-stripe-checkout';
import Swal from 'sweetalert2';
import AOS from 'aos';
import 'aos/dist/aos.css'; 
AOS.init({
    duration:2000
});

function Bookingscreen({ match }) {

    const [room, setroom] = useState([])
    const [loading, setloading] = useState(true);
    const [error, seterror] = useState(false);
    const roomid = match.params.roomid;
    const fromdate = moment(match.params.fromdate, 'DD-MM-YYYY');
    const todate = moment(match.params.todate, 'DD-MM-YYYY');

    const totaldays = moment.duration(todate.diff(fromdate)).asDays() + 1;
    const [totalamount, settotalamount] = useState();

    useEffect(async () => {

        
        try {
            setloading(true)
            const data = (await axios.post('/api/rooms/getroombyid', { roomid })).data;
            settotalamount(data.rentperday * totaldays)
            console.log(data);
            setroom(data);
            setloading(false);

        } catch (error) {

            setloading(false);
            seterror(true);
        }

    }, []);

    

    async function onToken(token){

        console.log(token);
        const bookingDetails = {

            room,
            userid: JSON.parse(localStorage.getItem('currentUser'))._id,
            fromdate,
            todate,
            totalamount,
            totaldays,
            token
        };

        try {
            setloading(true)
            const result = await axios.post('/api/bookings/bookroom', bookingDetails, )
            setloading(false)
            Swal.fire('Congratulations', 'Your Room Booked successfully', 'success').then(result=>{
                window.location.href='/profile'
            })
        } catch (error) {
            setloading(false)
            Swal.fire('Oops', 'Something went wrong', 'error')
        }
    }

    return (
        <div className="m-5" data-aos='flip-left'>
            {loading ? (<Loader />) : room ? (<div>

                <div className='row justify-content-center mt-5 bs'>

                    <div className="col-md-6">
                        <h1>{room.name}</h1>
                        <img src={room.imageurls[0]} className="bigimg" />
                    </div>

                    <div className="col-md-6">

                        <div style={{ textAlign: 'left' }}>
                            <h1>Booking Details</h1>
                            <hr />

                            <b>
                                <p>Name : {JSON.parse(localStorage.getItem('currentUser')).name}</p>
                                <p>From Date : {match.params.fromdate}</p>
                                <p>To Date : {match.params.todate}</p>
                                <p>Max Count : {room.maxcount}</p>
                            </b>
                        </div>


                        <div style={{ textAlign: 'left' }}>
                            <b>
                                <h1>Amount</h1>
                                <hr />
                                <p>Total Days : {totaldays}</p>
                                <p>Rent per day : {room.rentperday}</p>
                                <p>Total Amount : {totalamount} Rs.</p>
                            </b>
                        </div>

                        <div style={{ float: 'right' }}>
                            
                            <StripeCheckout
                                amount = {totalamount * 100}
                                token={onToken}
                                currency = 'INR'
                                stripeKey="pk_test_51JdE8uSIMSeJ5v7aXgesKaUrxibG2qkmcwo6KXF0M0Z3j3ayLDtFSaa4uhXqAMnGwlnvb3rnE5k2tnxxJT0I2hqf00LzIoii91"
                            >
                                <button className="btn btn-primary" >Pay now {" "}</button>
                            </StripeCheckout>
                        </div>
                    </div>

                </div>




            </div>) : (<Error />)}
        </div>
    );
}

export default Bookingscreen;
