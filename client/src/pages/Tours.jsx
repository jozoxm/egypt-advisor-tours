import React, { useState, useEffect } from 'react';

const Tours = ({ tours }) => {
    const [filteredTours, setFilteredTours] = useState(tours);
    const [sortOrder, setSortOrder] = useState('asc');
    const [filter, setFilter] = useState('');

    useEffect(() => {
        let updatedTours = tours;

        // Filtering
        if (filter) {
            updatedTours = updatedTours.filter(tour => 
                tour.name.toLowerCase().includes(filter.toLowerCase())
            );
        }

        // Sorting
        updatedTours.sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.price - b.price;
            } else {
                return b.price - a.price;
            }
        });

        setFilteredTours(updatedTours);
    }, [tours, sortOrder, filter]);

    return (
        <div>
            <input 
                type="text" 
                placeholder="Filter by name" 
                value={filter} 
                onChange={e => setFilter(e.target.value)} 
            />
            <select onChange={e => setSortOrder(e.target.value)} value={sortOrder}>
                <option value="asc">Price: Low to High</option>
                <option value="desc">Price: High to Low</option>
            </select>
            <ul>
                {filteredTours.map(tour => (
                    <li key={tour.id}>
                        {tour.name} - ${tour.price}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Tours;