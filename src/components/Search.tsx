import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import '../styles/App.css';
import { format } from 'date-fns';
import axios from 'axios';

const Search = () => {
    const [searchParams, setSearchParams] = useState({
        destination: '',
        checkInDate: '',
        checkOutDate: '',
        adults: 1,
        children: [{ age: ''}],
        rooms: 1
    });
    const [suggestions, setSuggestions] = useState<any[]>([]); 
    const [regionId, setRegionId] = useState(null);
    const router = useRouter();

    const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target;
        setSearchParams(prevParams => ({
            ...prevParams,
            [name]: value
        }));
    };

    const handleChildChange = (index: number, value: string) => {
        const newChildren = searchParams.children.map((child, i) =>
            i === index ? { ...child, age: value } : child
        );
        setSearchParams(prevParams => ({
            ...prevParams,
            children: newChildren
        }));
    };
    
    const addChild = () => {
        setSearchParams(prevParams => ({
            ...prevParams,
            children: [...prevParams.children, { age: '' }]
        }));
    };
    
    const deleteChild = (indexToDelete: number) => {
        setSearchParams(prevParams => ({
            ...prevParams,
            children: prevParams.children.filter((_, index) => index !== indexToDelete)
        }));
    };


   const getRegionId = async (query: string) => {
        const body = JSON.stringify({
            query: query,
            lang: "en"
        });
    
        const requestOptions: RequestInit = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: body
        };
    
        try {
            const response = await fetch("/api/search/proxy", requestOptions);
            const result = await response.json();
            console.log("Result:", result);
    
            if (result.data && result.data.regions) {
                const cities = result.data.regions.filter((region: any) => region.type === 'City');
                return cities;
            } else {
                console.log('No regions found');
                return [];
            }
        } catch (error) {
            console.log('Error:', error);
            return [];
        }
    };

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchParams.destination.length > 2) {  // Fetch suggestions if input length is more than 2
                const regions = await getRegionId(searchParams.destination);
                setSuggestions(regions);
            } else {
                setSuggestions([]);
            }
        };

        fetchSuggestions();
    }, [searchParams.destination]);

    const searchHotels = async (query: any) => {     
        
        const guests = [
            {
                adults: Number(searchParams.adults),
                children: searchParams.children.map(child => {
                    const age = parseInt(child.age, 10);
                    return age;
                })
            }
        ];

        const checkin = format(new Date(searchParams.checkInDate), 'yyyy-MM-dd');
        const checkout = format(new Date(searchParams.checkOutDate), 'yyyy-MM-dd');

        console.log(checkin); 
        console.log(checkout);

        // const body = JSON.stringify({
        //     "checkin": "2024-06-01",
        //     "checkout": "2024-06-04",
        //     "residency": "gb",
        //     "language": "en",
        //     "guests": [
        //         {
        //             "adults": 2,
        //             "children": []
        //         }
        //     ],
        //     "region_id": 536,
        //     "currency": "EUR"
        // });
        const body = {
            "checkin": "2024-06-01",
            "checkout": "2024-06-04",
            "residency": "gb",
            "language": "en",
            "guests": [
                {
                    "adults": 2,
                    "children": []
                }
            ],
            "region_id": 536,
            "currency": "EUR"
        };

        // const requestOptions: RequestInit = {
        //     method: 'POST',
        //     headers: {
        //         "Content-Type": "application/json"
        //     },
        //     body: body
        // };

        try {
            const response = await axios.post("/api/hotels/proxy", body);
            // const result = await response.json();
            console.log("Result:", response);
        } catch (error) {
            console.log('Error:', error);
        }
    
        //     if (result.data && result.data.hotels) {
        //         const hotelIds = result.data.hotels.slice(0,5).map((hotel: { id: any; }) => hotel.id);
        //         console.log('Hotel IDs:', hotelIds);
        
        //         // Display the hotel IDs
        //         hotelIds.forEach((hotelId: any, index: number) => {
        //             console.log(`Hotel ${index + 1}: ${hotelId}`);
        //         });
                
        //         return hotelIds; // Return the hotel IDs if needed
        //     } else {
        //         console.log('No hotels found');
        //         return [];
        //     }
        // } catch (error) {
        //     console.log('Error:', error);
        //     return [];
        // }
    };



    const handleSuggestionClick = (region: { name: any; id: React.SetStateAction<null>; }) => {
        setSearchParams(prevState => ({
            ...prevState,
            destination: region.name
        }));
        setRegionId(region.id);
        console.log(region.id);
        setSuggestions([]);  // Clear suggestions after selection
    };


    const onSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        console.log(searchParams);
        if (regionId) {
            console.log(`Using already set Region ID: ${regionId}`);
            // Fetch hotels based on region ID
            await searchHotels(regionId);
        }
    };

    return (
        <div className="search-container">
            <h1>Check-In Search</h1>
            <form className="search-form" onSubmit={onSubmit}>
                <div className="form-row">
                <div className="suggestions-container">
                        <input
                            className="destination-input"
                            type="text"
                            name="destination"
                            value={searchParams.destination}
                            onChange={handleInputChange}
                            placeholder="Destination"
                        />
                        {suggestions.length > 0 && (
                            <div className="suggestions-list-wrapper">
                                <ul className="suggestions-list">
                                    {suggestions.map((region) => (
                                        <li key={region.id} onClick={() => handleSuggestionClick(region)}>
                                            <div className="suggestion-text">
                                                <span className="suggestion-name">{region.name}, {region.country_code}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    <input
                        className="date-input"
                        type="date"
                        name="checkInDate"
                        value={searchParams.checkInDate}
                        onChange={handleInputChange}
                    />
                    <input
                        className="date-input"
                        type="date"
                        name="checkOutDate"
                        value={searchParams.checkOutDate}
                        onChange={handleInputChange}
                    />
                    <input
                        className="number-input"
                        type="number"
                        name="adults"
                        value={searchParams.adults}
                        onChange={handleInputChange}
                        placeholder="Number of Adults"
                    />
                    <div className="children-inputs-container">
                        {searchParams.children.map((child, index) => (
                            <div key={index} className="children-input-group">
                                <input
                                    className="number-input child-age-input"
                                    type="number"
                                    name="childAge"
                                    value={child.age}
                                    onChange={(e) => handleChildChange(index, e.target.value)}
                                    placeholder="Child Age"
                                />
                                {searchParams.children.length > 1 && (
                                    <button type="button" className="delete-child-button" onClick={() => deleteChild(index)}>
                                        Delete Child
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" className="add-child-button" onClick={addChild}>Add Child</button>
                    </div>
                    <input
                        className="number-input"
                        type="number"
                        name="rooms"
                        value={searchParams.rooms}
                        onChange={handleInputChange}
                        placeholder="Number of Rooms"
                    />
                    <button type="submit" className="search-button">Search</button>
                </div>
            </form>
        </div>
    );
    
}

export default Search;
