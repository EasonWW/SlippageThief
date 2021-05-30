import logo from './logo.svg';
import './App.css';
import "antd/dist/antd.css"
import { Input, Space } from 'antd';
import { Typography } from 'antd';
import { Card } from 'antd';
import axios from 'axios';
import { useState } from 'react';

const { Title } = Typography;

const { Search } = Input;

function App() {
  const [info, setInfo] = useState('This is the query result');
  const onSearch = async (value) => {
    const url = "";
    const result = await axios.get(`${url}${value}`);
    setInfo(String(result));
  };

  return (
    <div className="App">
      <Title>Front Running Query</Title>
          <Search
      placeholder="input search text"
      allowClear
      enterButton="Search"
      size="large"
      placeholder="Please input the transaction id"
      onSearch={onSearch}
    />
    <div className="gap"></div>
    <Card >
    <p>{info}</p>
  </Card>
    
    </div>
  );
}

export default App;
