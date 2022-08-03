import React, { Fragment } from "react";
import "./App.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { H1, Listbox, Field } from "@nyt-cms/ink";
import * as pathOptions from "./directories/path.json";

class App extends React.Component {
  state = {
    images: [],
    progress: 0,
    directory: "NewsService",
    path: "undefined",
  };
  preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  uploadFile = (files) => {
    const formData = new FormData();
    this.setState({
      progress: 0,
    });
    formData.append("newKey", `${this.state.directory}/${this.state.path}/`);
    files.forEach((file) => {
      formData.append("files", file, file.name);
    });
    axios
      .post("/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          this.setState({
            progress: parseInt(
              Math.round((progressEvent.loaded * 100) / progressEvent.total)
            ),
          });
        },
      })
      .then((res) => {
        this.previewFile(res.data);
        setTimeout(() => {
          this.setState({
            progress: 0,
          });
        }, 3000);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  previewFile = (data) => {
    data
      .toString()
      .split(",")
      .forEach((element) => {
        const dataSplit = element.split("/");

        const images = this.state.images;
        this.setState({
          images: images.concat({
            fileName: dataSplit[dataSplit.length - 1],
            destPath:
              dataSplit[dataSplit.length - 3] +
              "/" +
              dataSplit[dataSplit.length - 2],
            link: "tba!",
          }),
        });
      });
  };

  handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    this.uploadFile(Array.from(files));
  };

  handleDragOver = (e) => {
    e.preventDefault();
  };

  handleInputByClick = (e) => {
    this.uploadFile(Array.from(e.target.files));
  };

  handleDrop1Change = (e) => {
    console.log("Handle Directory Dropdown Change e:");
    console.log(e);
    this.setState({ directory: e });
  };

  handleDrop2Change = (e) => {
    console.log("Handle Path Dropdown Change e:");
    console.log(e);
    this.setState({ path: e });
  };

  componentDidMount() {
    const drop_region_container = document.getElementById(
      "drop-region-container"
    );
    const input = document.getElementById("file-input");
    ["dragenter", "dragover"].forEach((eventName) => {
      drop_region_container.addEventListener(eventName, () => {
        drop_region_container.classList.add("highlight");
      });
    });
    ["dragleave", "drop"].forEach((eventName) => {
      drop_region_container.addEventListener(eventName, () => {
        drop_region_container.classList.remove("highlight");
      });
    });

    // click to upload
    drop_region_container.addEventListener("click", () => {
      input.click();
    });
  }

  render() {
    const { progress } = this.state;
    return (
      <div className="App">
        <div className="container">
          <H1>Drag and Drop Image Uploader with AWS S3</H1>

          <div className="dropDown">
            <Field id="listbox-label" label="Directory">
              <Listbox
                id="listbox-control"
                aria-labelledby="listbox-label"
                defaultValue={"NewsService"}
                onChange={this.handleDrop1Change}
              >
                <Listbox.Item value="NewsService" />
                <Listbox.Item value="IW_Send" />
                <Listbox.Item value="TDRouter" />
                <Listbox.Item value="Syndicate" />
                <Listbox.Item value="Spending" />
              </Listbox>
            </Field>
            <p className="mx-auto"></p>
            <Field id="listbox-label" label="Path">
              <Listbox
                id="listbox-control"
                aria-labelledby="listbox-label"
                onChange={this.handleDrop2Change}
              >
                {pathOptions[this.state.directory].map((path) => (
                  <Listbox.Item value={path} />
                ))}
              </Listbox>
            </Field>
          </div>

          <div
            id="drop-region-container"
            className="drop-region-container mx-auto"
            onDrop={this.handleDrop}
            onDragOver={this.handleDragOver}
          >
            <div id="drop-region" className="drop-region text-center">
              <img id="download-btn" src="/Download.png" width="40" alt="" />
              <H1>Drag and Drop or Click to Upload</H1>
              <input
                id="file-input"
                type="file"
                multiple
                onChange={this.handleInputByClick}
              />
            </div>
          </div>
          <p className="mx-auto" style={{ padding: `10px` }}>
            <strong>Uploading Progress</strong>
          </p>
          <div className="progress mx-auto">
            <div
              id="progress-bar"
              className="progress-bar progress-bar"
              role="progressbar"
              aria-valuenow="40"
              aria-valuemin="0"
              aria-valuemax="100"
              style={{ width: `${progress}%` }}
            >
              {progress}%
            </div>
          </div>

          <div id="preview">
            <table id="uploadedimg">
              <tbody>
                <tr>
                  <th>File Name</th>
                  <th>Key</th>
                  <th>Logs Link</th>
                </tr>

                {this.state.images.map((image, index) => (
                  <tr key={index}>
                    <td>{image.fileName}</td>
                    <td>{image.destPath}</td>
                    <td>{image.link}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
