import React from "react";
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
    path: "",
    currentDate: date,
    renderSelector: "",
    renderNoti: "",
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
      const fileType = file.name.split(".").pop().toLowerCase();
      console.log("File name is: " + file.name);
      console.log("File Type is: " + fileType);
      if (fileType === "png" || fileType === "jpeg" || fileType === "pdf") {
        formData.append("files", file, file.name);
      } else {
        this.setState({
          renderNoti: this.renderNotification("BadFileType"),
        });
      }
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

        if (
          dataSplit[dataSplit.length - 1] !== "" &&
          (dataSplit[dataSplit.length - 3] !== "undefined" ||
            dataSplit[dataSplit.length - 2] !== "undefined")
        ) {
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
        }
      });
  };

  validateUpload = () => {
    console.log(
      "This is the path we're validating: " + JSON.stringify(this.state.path)
    );

    if (this.state.directory === "") {
      this.setState({
        renderNoti: this.renderNotification("UndefinedDir"),
      });
      return false;
    } else if (this.state.directory !== "Embargo" && this.state.path === "") {
      this.setState({
        renderNoti: this.renderNotification("UndefinedPath"),
      });
      return false;
    } else if (this.state.directory === "Embargo" && this.state.path === "") {
      this.setState({
        renderNoti: this.renderNotification("UndefinedDate"),
      });
      return false;
    } else if (
      this.state.directory === "Embargo" &&
      typeof this.state.path === "object"
    ) {
      this.setState({
        renderNoti: this.renderNotification("BadDate"),
      });
      return false;
    } else {
      this.setState({ renderNoti: "", errorType: "" });
      return true;
    }
  };

  handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    // TODO: check everything is defined pls + also check file type
    if (this.validateUpload()) {
      this.uploadFile(Array.from(files));
    }
  };

  handleDragOver = (e) => {
    e.preventDefault();
  };

  handleInputByClick = (e) => {
    // TODO: check everything is defined pls
    e.preventDefault();
    if (this.validateUpload()) {
      this.uploadFile(Array.from(e.target.files));
    }
  };

  handleDrop1Change = (e) => {
    console.log("Handle Directory Dropdown Change e:");
    console.log(e);
    if (e === "Embargo") {
      this.setState({
        directory: e,
        renderSelector: this.renderDatepickerField(),
        path: "",
      });
    } else {
      this.setState({
        directory: e,
        renderSelector: this.renderPathField(e),
        path: "",
      });
    }
  };

  handleDrop2Change = (e) => {
    console.log("Handle Path Dropdown Change e:");
    console.log(e);
    this.setState({ path: e });
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

  renderDatepickerField = () => {
    return (
      <Field
        label="Select a date to release a file:"
        // message={this.getMessage()}
        // error={!!this.getMessage()}
        id="dwv-field"
      >
        <Datepicker
          onChange={this.handleDrop2Change}
          firstSelectableDate={this.currentDate}
          id="dwv"
        />
      </Field>
    );
  };

  handleNotificationClick = () => {
    this.setState({ renderNoti: "" });
  };

  renderNotification = (errorType) => {
    return (
      <div class="alert">
        <span class="closebtn" onClick={this.handleNotificationClick}>
          &times;
        </span>
        <strong>Files Upload Error!</strong> {this.getMessage(errorType)}
      </div>
    );
  };

  //getMessage function - returns "" or error if date isn't correct
  getMessage = (errorType) => {
    if (errorType === "UndefinedDir") {
      return "Directory is undefined! Please select a directory in the dropdown. If error persists, please refresh the page.";
    } else if (errorType === "UndefinedPath") {
      return "Path is undefined! Please select a path in the dropdown. If error persists, please refresh the page.";
    } else if (errorType === "UndefinedDate") {
      return "Embargo date is undefined! Please select a valid date in MM/DD/YY format. If error persists, please refresh the page.";
    } else if (errorType === "BadDate") {
      return "Embargo date is not valid. Please select a valid date in MM/DD/YY format. If error persists, please refresh the page.";
    } else if (errorType === "BadFileType") {
      return "File type is not supported. Please upload only JPEG/PNG/PSD  If error persists, please refresh the page.";
    } else {
      return "";
    }
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

          <div>{this.state.renderNoti}</div>

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
