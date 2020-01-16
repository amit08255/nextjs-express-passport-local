import React from 'react';

const Homepage = (props) => {

    return (
        <form method="post" action="/login">
            <input name="username"/>
            <input name="password" type="password"/>
            <input type="submit" value="Login"/>
        </form>
    );
}

export default Homepage;