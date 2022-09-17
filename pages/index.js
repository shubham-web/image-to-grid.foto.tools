import Head from "next/head";

import { Component, createRef } from "react";

class Home extends Component {
	constructor(props) {
		super(props);

		this.state = {
			url: "",
		};

		this.firstTile = {
			sx: 0,
			sy: 0,
			sWidth: 510 / 3,
			sHeight: 510 / 3,
			dx: 0,
			dy: 0,
			dWidth: 510 / 3,
			dHeight: 510 / 3,
		};
		this.tilePainPos = [
			{
				...this.firstTile,
			},
			{
				...this.firstTile,
				sx: (510 / 3) * 1,
			},
			{
				...this.firstTile,
				sx: (510 / 3) * 2,
			},
			{
				...this.firstTile,
				sy: (510 / 3) * 1,
			},
			{
				...this.firstTile,
				sx: (510 / 3) * 1,
				sy: (510 / 3) * 1,
			},
			{
				...this.firstTile,
				sx: (510 / 3) * 2,
				sy: (510 / 3) * 1,
			},
			{
				...this.firstTile,
				sy: (510 / 3) * 2,
			},
			{
				...this.firstTile,
				sx: (510 / 3) * 1,
				sy: (510 / 3) * 2,
			},
			{
				...this.firstTile,
				sx: (510 / 3) * 2,
				sy: (510 / 3) * 2,
			},
		];

		this.mainCanvas = createRef();
		this.urlInput = createRef();
		this.ctx;
	}
	componentDidMount() {
		let canvas = this.mainCanvas.current;
		canvas.width = 510;
		canvas.height = 510;
		this.ctx = canvas.getContext("2d");

		this.setState({
			url: localStorage.getItem("foto_imageurl") || "https://source.unsplash.com/random/500x500",
		});

		this.syncUrl();
	}
	blobToDataURL = (blob, callback) => {
		let a = new FileReader();
		a.onload = function (e) {
			callback(e.target.result);
		};
		a.readAsDataURL(blob);
	};
	syncUrl = async (e) => {
		if (e) {
			this.setState({
				url: e.target.value,
			});
		}

		if (this.state.url === "") return;

		let image = new Image();
		let imgBlob = await fetch(this.state.url)
			.then((e) => e.blob())
			.catch(console.log);

		if (!imgBlob) {
			alert("Couldn't load image, This is most probably a CORS issue.");
			return;
		}
		this.blobToDataURL(imgBlob, (dataurl) => {
			image.src = dataurl;
		});

		image.addEventListener("load", (e) => {
			this.ctx.clearRect(0, 0, 510, 510);
			this.ctx.drawImage(image, 0, 0, 510, 510);

			localStorage.setItem("foto_imageurl", this.state.url);

			if (this.state.url === "") {
				localStorage.removeItem("foto_imageurl");
			}
		});
	};
	componentDidUpdate(_prevProps, prevState) {
		if (prevState.url !== this.state.url) {
			this.syncUrl();
		}
	}
	handleDownloadClick = () => {
		let cnvs = [];
		for (let i = 0; i < 9; i++) {
			let cnv = document.createElement("canvas");
			cnv.style.border = "1px solid";
			cnv.id = `#_canvas${i}`;
			cnv.width = 510 / 3;
			cnv.height = 510 / 3;
			let cctx = cnv.getContext("2d");
			let { sx, sy, sWidth, sHeight, dx, dy } = this.tilePainPos[i];
			let imgD = this.ctx.getImageData(sx, sy, sWidth, sHeight);
			console.log(imgD);
			cctx.putImageData(imgD, dx, dy);
			cnvs.push(cnv);
		}

		cnvs.forEach((cnv, index) => {
			let dataUrl = cnv.toDataURL();
			let a = document.createElement("a");
			a.href = dataUrl;
			a.download = `tile ${index + 1}.png`;
			a.click();
		});
	};
	render() {
		return (
			<>
				<Head>
					<title>Image to Grid - 9 Images</title>
					<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css" />
				</Head>

				<div className="container">
					<div className="input-field">
						<input
							onChange={(e) => {
								this.setState({
									url: e.target.value,
								});
							}}
							placeholder="Paste Image URL Here"
							autoFocus={true}
							autoComplete="yes"
							ref={this.urlInput}
							type="url"
							value={this.state.url}
						/>
					</div>

					<span style={{ display: "block", marginBottom: "16px" }}>Preview:</span>
					<div className="preview">
						<img className="gridimg" src="https://tlgur.com/d/Gollrvdg" />
						<canvas ref={this.mainCanvas} width="512" height="512" className="transparency-grid" id="canvas"></canvas>
					</div>
					<button onClick={this.handleDownloadClick} id="downloadBtn" className="waves-effect waves-light btn">
						Download Grid
					</button>
				</div>
			</>
		);
	}
}

export default Home;
