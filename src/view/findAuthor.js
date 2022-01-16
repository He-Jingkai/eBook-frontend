import React from "react";
import {HeadOfPage} from "../components/head";
import {Input,Card} from "antd";

export class FindAuthor extends React.Component{
    constructor(props) {
        super(props);
        this.state={
            num:0,
            total:0,
            author: "PLEASE INPUT BOOK'S TITLE",
            title:""
        }
    }

    componentWillMount(){
        this.setState({
            num:localStorage.getItem("num"),
            total:localStorage.getItem("total"),
        })
    }


    search = (e) => {
        let needle = e.target.value.toLowerCase();
        if (!needle)
            this.setState({
                author: "PLEASE INPUT BOOK'S TITLE",
                title:""
            });
        else
            fetch("http://localhost:8080/findauthor/findAuthorByName?title="+needle)
                .then(response => response.text())
                .then(data => {
                    this.setState({
                        author: data,
                        title:needle
                    });
                }).catch(function (ex) {
                console.log('parsing failed', ex)
            })
    };


    render() {
        return (
            <div id="wrapper">
                <div className="wrapper-holder">
                    <HeadOfPage num={this.state.num} total={this.state.total}/>
                    <section className="main">
                        <div className="content">
                            <div style={{ marginBottom: 16 }} onChange ={this.search}>
                                <Input addonBefore='Book Name' id="searchbar"
                                       defaultValue="" />
                            </div>
                        </div>
                    </section>
                    <div className="content">
                        <Card title={"The Author of "+this.state.title} bordered={false} style={{ width: 300 }}>
                            <p>{this.state.author}</p>
                        </Card>
                    </div>
                    </div>
            </div>
        );
    }
}
