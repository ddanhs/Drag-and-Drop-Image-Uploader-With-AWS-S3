import React, { Fragment } from "react";
import "./App.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { H1, Listbox, Field, Datepicker } from "@nyt-cms/ink";
import * as pathOptions from "./directories/path.json";

const current = new Date();
const date = `${current.getDate()}/${
  current.getMonth() + 1
}/${current.getFullYear()}`;

class App extends React.Component {
  state = {
    images: [],
    progress: 0,
    directory: "",
    // TODO: Set embargo to path???
    path: "undefined",
    embargoDate: "",
    currentDate: date,
    renderSelector: "",
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
    if (this.state.directory == "Embargo") {
      formData.append(
        "newKey",
        `${this.state.directory}/${this.state.embargoDate}/`
      );
    } else {
      formData.append("newKey", `${this.state.directory}/${this.state.path}/`);
    }
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
    // TODO: check everything is defined pls
    this.uploadFile(Array.from(files));
  };

  handleDragOver = (e) => {
    e.preventDefault();
  };

  handleInputByClick = (e) => {
    // TODO: check everything is defined pls
    this.uploadFile(Array.from(e.target.files));
  };

  handleDrop1Change = (e) => {
    console.log("Handle Directory Dropdown Change e:");
    console.log(e);
    if (e == "Embargo") {
      this.setState({
        directory: e,
        renderSelector: this.renderDatepickerField(),
      });
    } else {
      this.setState({ directory: e, renderSelector: this.renderPathField(e) });
    }
  };

  handleDrop2Change = (e) => {
    console.log("Handle Path Dropdown Change e:");
    console.log(e);
    this.setState({ path: e });
  };

  handleDateChange = (e) => {
    console.log("Handle Date Change e:");
    console.log(e);
    this.setState({ embargoDate: e });
  };

  renderPathField = (e) => {
    return (
      <Field id="listbox-label" label="Path">
        <Listbox
          id="listbox-control"
          aria-labelledby="listbox-label"
          onChange={this.handleDrop2Change}
        >
          {pathOptions[e].map((path) => (
            <Listbox.Item value={path} />
          ))}
        </Listbox>
      </Field>
    );
  };

  //getMessage function - returns "" or error if date isn't correct

  renderDatepickerField = () => {
    return (
      <Field
        label="Select a date to release a file:"
        // message={getMessage(this.embargoDate)}
        // error={!!getMessage(this.embargoDate)}
        id="dwv-field"
      >
        <Datepicker
          // value={value}
          // TODO: change to handleDrop2Change ?? set path to date
          onChange={this.handleDateChange}
          firstSelectableDate={this.currentDate}
          id="dwv"
        />
      </Field>
    );
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
          <H1>TNS: Sender</H1>

          <div className="dropDown">
            <Field id="listbox-label" label="Directory">
              <Listbox
                id="listbox-scontrol"
                aria-labelledby="listbox-label"
                onChange={this.handleDrop1Change}
              >
                <Listbox.Item value="NewsService" />
                <Listbox.Item value="IW_Send" />
                <Listbox.Item value="Digest" />
                <Listbox.Item value="Syndicate" />
                <Listbox.Item value="Spending" />
                <Listbox.Item value="Embargo" />
              </Listbox>
            </Field>
            <p className="mx-auto"></p>
            {this.state.renderSelector}
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
