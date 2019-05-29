import React from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';

import Search from './Search';
import Ratings from './Ratings';
import ReviewsList from './ReviewsList';
import MainRating from './MainRating';
import SearchDescription from './SearchDescription';

import styles from './App.css';


class App extends React.Component {
  constructor() {
    super();
    this.state = {
      allReviews: [],
      currentReviews: [],
      currentPageReviews: [],
      currentSearchTerm: '',
      allAverageRatings: {},
      isSearching: false,
      pageCount: 0,
    };
    this.searchSubmit = this.searchSubmit.bind(this);
    this.searchBarTextChange = this.searchBarTextChange.bind(this);
    this.calculateAverageRating = this.calculateAverageRating.bind(this);
    this.storeAllAverageRatings = this.storeAllAverageRatings.bind(this);
    this.backToAllReviews = this.backToAllReviews.bind(this);
    this.handlePageClick = this.handlePageClick.bind(this);
  }

  componentDidMount() {
    const component = this;
    const locationID = window.location.pathname.split('/')[2];
    axios.get(`/api/locations/${locationID}/reviews`)
      .then((location) => {
        // only first 5 reviews
        let allReviews = location.data.reviews;
        let pageCount = Math.ceil(allReviews.length/5);
        let currentReviews = [];
        for (let i = 0; i < 5; i += 1) {
          currentReviews.push(allReviews[i])
        }

        component.setState({ allReviews, currentReviews, pageCount });
      })
      .then(() => component.storeAllAverageRatings());
  }

  searchBarTextChange(e) {
    this.setState({
      currentSearchTerm: e.target.value,
    });
  }

  searchSubmit(e) {
    e.preventDefault();

    const selectedArray = [];
    for (let i = 0; i < this.state.allReviews.length; i += 1) {
      const currentReviewObject = this.state.allReviews[i];
      const currentReviewText = currentReviewObject.text;
      if (currentReviewText.includes(this.state.currentSearchTerm)) {
        selectedArray.push(this.state.allReviews[i]);
      }
    }
    this.setState(() => ({
      currentReviews: selectedArray,
      isSearching: true,
    }));
  }

  backToAllReviews() {
    let currentReviews = [];
      for (let i = 0; i < 5; i += 1) {
        currentReviews.push(this.state.allReviews[i])
      }
    this.setState({
      currentReviews,
      isSearching: false,
      currentSearchTerm: '',
    });
  }

  calculateAverageRating(ratingCategory) {
    let combinedRatingTotal = 0;
    const numberOfReviews = this.state.allReviews.length;
    for (let i = 0; i < numberOfReviews; i += 1) {
      combinedRatingTotal += this.state.allReviews[i][ratingCategory];
    }
    const averageRating = combinedRatingTotal / numberOfReviews;
    const nearestHalfRating = Math.ceil(averageRating * 2) / 2;
    return nearestHalfRating;
  }


  storeAllAverageRatings() {
    const accuracy = this.calculateAverageRating('rating-accuracy');
    const communication = this.calculateAverageRating('rating-communication');
    const cleanliness = this.calculateAverageRating('rating-cleanliness');
    const location = this.calculateAverageRating('rating-location');
    const checkin = this.calculateAverageRating('rating-check-in');
    const value = this.calculateAverageRating('rating-value');
    const allAverageRatings = {
      accuracy,
      communication,
      cleanliness,
      location,
      checkin,
      value,
    };
    this.setState({
      allAverageRatings,
    });
  }

  handlePageClick(page) {
    let currentPageMultiplier = page.selected;
    let currentReviews = [];
    let i = 5 * currentPageMultiplier;
    let loopEnd = i + 4;
    for ( i; i <= loopEnd; i++ ) {
      if (this.state.allReviews[i]) {
        currentReviews.push(this.state.allReviews[i])
      }
    }
    this.setState({ currentReviews });
  }


  render() {
    const { backToAllReviews, searchSubmit, searchBarTextChange, handlePageClick } = this;
    
    const {
      isSearching, allAverageRatings, allReviews,
      currentReviews, currentSearchTerm, pageCount
    } = this.state;
    
    let bottomComponent;
    
    // very unclean switch statement, what is the best practice?
    !isSearching ? bottomComponent = 
        <div>
          <Ratings allAverageRatings={allAverageRatings}/>
          <ReviewsList currentReviews={currentReviews}/>
      </div> :
      bottomComponent = 
      <SearchDescription
        searchedReviews={currentReviews}
        backToAllReviews={backToAllReviews}
        currentSearchTerm={currentSearchTerm}
      />

      return (
        <div className="main-app">
          <div className="header">
            <MainRating
              className="main-rating"
              allAverageRatings={allAverageRatings}
              numberOfReviews={allReviews.length}/>
            <Search
              className="search"
              searchSubmit={searchSubmit}
              searchBarTextChange={searchBarTextChange}
            />
          </div>
          {bottomComponent}
          <ReactPaginate
            className="pagination-component"
            previousLabel={'<'}
            nextLabel={'>'}
            breakLabel={'...'}
            breakClassName={'break-me'}
            pageCount={pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={'pagination'}
            subContainerClassName={'pages pagination'}
            activeClassName={'active'}
          />
        </div>
      );
  }
}

export default App;
