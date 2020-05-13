# React Endless Feed

<h6 align="center">About</h6>
<p align="center">
    <a href="https://github.com/Kushuh/react-endless-scroller">
        <img src="https://img.shields.io/npm/v/react-endless-feed" alt="version"/>
    </a>
    <a href="https://github.com/Kushuh/react-endless-scroller/blob/master/LICENSE">
        <img src="https://img.shields.io/npm/l/react-endless-feed" alt="license"/>
    </a>
    <a href="https://github.com/Kushuh/react-endless-scroller/issues">
        <img src="https://img.shields.io/github/issues-raw/kushuh/react-endless-scroller" alt="open issues"/>
    </a>
    <a href="https://github.com/Kushuh/react-endless-scroller">
        <img src="https://img.shields.io/github/last-commit/Kushuh/react-endless-scroller" alt="activity"/>
    </a>
    <a href="https://github.com/Kushuh/react-endless-scroller/graphs/contributors">
        <img src="https://img.shields.io/github/contributors/Kushuh/react-endless-scroller" alt="contributors"/>
    </a>
</p>

<h6 align="center">More</h6>
<p align="center">
    <a href="https://github.com/Kushuh/react-endless-scroller">
        <img src="https://img.shields.io/github/repo-size/kushuh/react-endless-scroller" alt="repo size"/>
    </a>
    <a href="https://github.com/facebook/react">
        <img src="https://img.shields.io/github/package-json/dependency-version/Kushuh/react-endless-scroller/react" alt="react version"/>
    </a>
    <a href="https://github.com/Kushuh/kushuh-react-utils">
        <img src="https://img.shields.io/github/package-json/dependency-version/Kushuh/react-endless-scroller/kushuh-react-utils" alt="react version"/>
    </a>
</p>

## About

React Endless Feed is a useful component to quickly create an infinite scroll element, with minimal backend API requirements and easy frontend declaration.

It comes in two components : a high level one, with some pre-built visual handlers, and a more low level one, for deeper integration and customization.

## Components

+ **[EndlessFeedHandler (low level)](#endlessscrollhandler-low-level)**
    + [Minimal example](#minimal-example)
    + [Full props example](#full-props-example)
    + [Overview](#overview)
    + [Inputs](#inputs)
    + [Outputs (props)](#outputs-props)
        + [feed.params](#endlessscrollparams)
        + [feed.onScroll](#endlessscrollonscroll)
        + [feed.search](#endlessscrollsearch)
        + [⚠️ feed.mutateState](#-endlessscrollmutatestate)
        + [Content mutators](#content-mutators)
            + [feed.removeTuples](#endlessscrollremovetuples)
            + [feed.insertTuples](#endlessscrollinserttuples)
+ **[Copyright](#copyright)**

## EndlessFeedHandler (low level)

### Minimal example

For how to build the backendApi, please refer to <a href="https://github.com/Kushuh/react-endless-scroller/blob/master/APISPECSHEET.md">this specsheet</a>.

*Wrapper.jsx*
```jsx
import React from 'react';
import {EndlessFeedHandler} from 'react-endless-feed';
import Container from 'path/to/Container.jsx';
import backendApi from 'path/to/api';

const Wrapper = () => {
  //...

  return (
    <EndlessFeedHandler api={backendApi}>
        <Container/>
    </EndlessFeedHandler>
  );
};

export default Wrapper;
```

*Container.jsx*
```jsx
import React from 'react';
import Tuple from 'path/to/Tuple.jsx';

const Container = ({feed, ...props}) => {
  //...
  
  return (
    <div onScroll={feed.onScroll}>
    
        {feed.params.tuples.map(
          // Each result should contain a unique key attribute and use it 
          // as an id. The key attribute is reserved by React, and should
          // also be declared here.
          ({key, ...tuple}) => <Tuple id={key} key={key} {...tuple}/>
        )}
    
    </div>
  );
};

export default Container;
```

### Full props example

*Wrapper.jsx*
```jsx
import React from 'react';
import Container from 'path/to/container';
import backendApi from 'path/to/api';

const Wrapper = () => {
  //...

  return (
    <EndlessFeedHandler
      api={backendApi}
      packetSize={30}
      loadSize={120}
      bypassLoadSize={false}
      inRushLoad={true}
      inRushLoadSize={60}
      deferLaunch={false}
      loadThreshold={{top: 100, bottom: 100}}
      errorHandler={error => console.error(error)}
      initialProps={{
      	boundaries: {start: 50, end: 52},
        flags: {endOfResults: true},
        results: [
          {key: 'element-50', foo: 'bar'},
          {key: 'element-51', foo: 'bar2'}
        ]
      }}
      queryParams={{
        search: 'blue jeans',
        filter: {price: [15, 50]}
      }}
      postLoadAction={result => {
        console.log('fetch successful !', result.flags.endOfResults);
      }}
    >
        <Container/>
    </EndlessFeedHandler>
  );
};

export default Wrapper;
```

### Overview

The EndlessFeedHandler wraps a page component, and pass some useful props to it, to easily feed user with infinite content.

The component will handle the network calls, based on the current scroll position in the scrollable element that handles the tuples.

### Inputs

| key | type | required | default | description |
| :---: | :---: | :---: | :---: | :--- |
| api | (object) => Promise\<object\> | true | - | The api has to comply with the <a href="https://github.com/Kushuh/react-endless-scroller/blob/master/APISPECSHEET.md">component Api Specsheet</a>.<br />The api should use an index based pagination. |
| packetSize | number<br />1 < n | - | 30 | The maximum number of tuples to load on each fetch. |
| loadSize | number<br />3 < n & 1.5 * packetSize <= n | - | 120 | The maximum number of tuples to keep in the DOM.**(1)** |
| ⚠️ bypassLoadSize | boolean | - | false | Disable the content limit to load in the DOM.**(2)** |
| inRushLoad | boolean | - | true | Force bigger loads when their is not enough content on the wall. |
| inRushLoadSize | number<br/>1 < n | - | 60 | When inRushLoad is active and not enough content is available on the wall, determine the amount of data to load instead of packetSize. |
| deferLaunch | boolean | - | false | Disable the initial fetch launched by the component when mounted.**(3)** |
| loadThreshold.top | number<br/> 0 <= n | - | 1 | Distance in pixel from top, when a new backward fetch has to be triggered.**(4)** |
| loadThreshold.bottom | number<br/> 0 <= n | - | 1 | Distance in pixel from bottom, when a new forward fetch has to be triggered.**(4)** |
| errorHandler | Function | - | - | A function that is called each time an error occurs inside the component. |
| initialProps | object | - | - | Override some initial state parameters.**(5)** |
| queryParams | any | - | object | Additional parameters to send to the api for fetches. |
| postLoadAction | Function | - | - | Is triggered after each successful fetch.**(6)** |

**(1)** This prop default value can be overridden with the bypassLoadSize flag.

**(2)** Be careful this should be used only for development purposes, as it can harm both memory and performances with large datasets.

**(3)** If you use the deferLaunch flag, you'll have to trigger the first fetch manually. This can be done using the `feed.search()` function, passed to the container props.

**(4)** By default, the component will wait for the user to scroll to one of the page limits to trigger fetch (either backward or forward). However, for a smoother user experience, and a better "infinite" sensation, it is advised to add larger thresholds. Thus, fetch will be called earlier and lower the "wait for load" impression.<br/>
Larger thresholds means new content will always be loaded before user reach the limit, until none is left.

**(5)** Boundaries, flags, tuples, loading, empty, launched can be overridden.

**(6)** It is interesting to take a look at how the component handles network calls. Fetch occurs in the following order:
```
- Call to class method handler.
    - Update flags and eventually keep a snapshot of the pre-fetch state.
    - Call to loadPacket external handler.
        - Compute parameters for the api call.
        - Call the api.
        - Compute results and merge them with the current set.
        - Returns an updated state.
    - Call postLoadAction with external handler return value.
    - Update component state.
    - Adjust visual state for cohesion with the previous one.
```
As you can see, postLoadAction is called **before** the state actually being updated, allowing for quicker response.
As a counterpart, it will receive a partial snapshot of the new state as a parameter, along with the full api results (to handle some special returns that are ignored by the component).
If you need to wait for the state to fully update, prefer listening to your props, as they will be refreshed.

Also keep in mind it won't trigger if any error occurs. For this particuliar case, use the *errorHandler* property.

```js
const postLoadAction = ({apiResults, ...partialState}) => {
  // do anything.
  return;
};
```

### Outputs (props)

The component adds the following parameters to children, under the `feed` props.

#### feed.params

A snapshot of the current component state.

| key | type | description |
| :---: | :---: | :--- |
| tuples | Array<object> | A list of the currently loaded tuples.**(1)** |
| flags.beginningOfResults | boolean | Indicate if tuples are still left in backward fetch mode (before the first result). |
| flags.endOfResults | boolean | Indicate if tuples are still left in forward fetch mode (after the last result). |
| boundaries.start | number | The dataset index of the first tuple. |
| boundaries.end | number | The dataset index of the last tuple. |
| loading | boolean | Set to true if a fetch operation is ongoing. |
| empty | boolean | Set to true if no tuples were returned, and both beginningOfResults and endOfResults have been set to true. |
| launched | boolean | Set to true once the component has trigger a successful fetch. |

**(1)** Each tuple is an object, that has to contain at least a unique key attribute.

#### feed.onScroll

Scroll handler to add to the scrollable container. It is responsible for triggering api fetches.

```jsx
onScroll(event);
```

#### feed.search

Search function. A search will reset the component state (mutateState with empty parameters), then repopulate tuples with an updated fetch.

```jsx
// Takes no parameters.
search();
```

#### ⚠️ feed.mutateState

Mutate the parent state. If no parameters are being passed, it will reset the parent state with some default parameters.

```jsx
// Update query params.
mutateState({queryParams: someParams});

// Reset the state to a default state.
mutateState();
```

Above are the parameters of the default state. Any absent parameter will remain untouched.

```jsx
{
    tuples: [],
    boundaries: {
        start: 0,
        end: 0
    },
    loading: false,
    flags: {
        beginningOfResults: true,
        endOfResults: false
    },
    empty: false,
    launched: false
}
```

⚠️ This function has minimal guard control and can lead to unwanted behaviors.

#### Content mutators

Content mutators are used to dynamically update some parts of the feed.
They can be used to add non network content, or to handle some editing options (if you want to delete a tuple for example).

Note they don't change any parameters (such as flags or boundaries). If you want to do so,
please use them along with `mutateState` or `search` methods.

Mutators behavior can be implemented with `mutateState`, however they take some extra care to handle duplicate keys and data integrity. If any change needs to be made to the feed, they should be prefered.

#### feed.removeTuples

Remove a list of tuples from the current list. Tuples are represented by their unique key attribute.

```jsx
// scrollableElementRef is optional. If omitted, set it to null or undefined,
// as the first parameter will automatically be attributed to it.
removeTuples(scrollableElementRef, tupleKey1, tupleKey2, ...);
```

ℹ️ scrollableElementRef force a refresh of the page status after the operation. It has to be a valid React ref.

#### feed.insertTuples

Insert a list of tuples in the current list. New tuples have each to contain a unique key attribute. Index is optional and will by default append results to the current dataset.

```jsx
// scrollableElementRef is optional. If omitted, set it to null or undefined,
// as the first parameter will automatically be attributed to it.
insertTuples(scrollableElementRef, tuples, index);
```

ℹ️ insert takes an extra index attribute, to tell the component where to insert the new tuples.

## Copyright
2020 Kushuh - MIT license