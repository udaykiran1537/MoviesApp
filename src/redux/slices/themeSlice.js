import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isDarkMode:true,
};

const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        toggleDarkMode: (state) => {
            state.isDarkMode = !state.isDarkMode;
            console.log("Dark mode toggled:", state.isDarkMode);
        },
    },
});

export const { toggleDarkMode } = themeSlice.actions;
export default themeSlice.reducer;