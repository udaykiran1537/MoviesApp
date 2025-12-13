import { configureStore } from "@reduxjs/toolkit";
import authSlice from './slices/authSlice';
import movieSlice from './slices/movieSlice'; 
import seriesSlice from './slices/seriesSlice'
import movieDetailSlice from './slices/movieDetailSlice'; 
import seriesDetailSlice from './slices/seriesDetailSlice'; 
import searchSlice from './slices/searchSlice'; 
import wishlistSlice from './slices/wishlistSlice'; 
import themeSlice from './slices/themeSlice';


export const store = configureStore({
    reducer:{
        auth: authSlice,
        movies: movieSlice,
        series: seriesSlice, 
        movieDetail: movieDetailSlice, 
        seriesDetail: seriesDetailSlice, 
        search: searchSlice, 
        wishlist: wishlistSlice, 
        theme: themeSlice,

    }
});