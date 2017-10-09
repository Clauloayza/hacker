'use strict'

const DEFAULT_QUERY = 'redux';
const DEFAULT_PAGE = 0;
const DEFAULT_HPP = '100';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

class HackerNewsModel {

	constructor () {
		this.result = null;
		this.searchTerm = '';

		this.notify = null;

		this.fetchSearchTopstories (this.searchTerm, 0);
	}

	subscribe (render) {
		this.notify = render;
	}

	orderBy (param) {
		if (!this.result)
			return;

		const  compare = (a, b) => {
			if (a > b) {
				return 1;
			}
			if (a < b) {
				return -1;
			}
			return 0;
		};

		this.result.sort ( (a, b) => {
			switch (param) {
				case 'title':
					return compare(a.title,  b.title);
				case 'author':
					return compare(a.author,  b.author);
				case 'comments':
					return compare(a.num_comments,  b.num_comments);
				case 'points':
					return compare(a.points,  b.points);
				default:
			}
		});
		notify ();
	}

	removeById (id) {
		this.result = this.result.filter ( e => e.objectID != id);
		this.notify();
	}

	fetchSearchTopstories(searchTerm, page) {
		const url=`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`;

		fetch(url)
			.then(response => response.json())
			.then(result => this.setSearchTopstories(result))
			.catch(e => e);
	}


	setSearchTopstories(result) {
		const {hits, page} = result;
		console.log ("hits", hits);
		console.log ("page", page);
		this.result = hits;

		this.notify();
	}

}

const  SearchForm  = ({model}) => {
	const onSubmit =  (e) => {
		e.preventDefault();
		model.fetchSearchTopstories(model.searchTerm, 0);
	};
	const onChange = (e) => {
		model.searchTerm = e.target.value;
	}

	return (
	<div className="interactions">
		<form className="form-inline" onSubmit={onSubmit}>
			<input
				type="text"
				className="form-control"
				defaultValue={model.searchTerm}
				onChange={onChange}
				placeholder="Search..."
			/>
			<button type="submit" className="btn btn-default">Search</button>
		</form>
	</div>);
}

const HackerNewsRow = ( {id, title, author, comments, points, onRemove}  ) => {


	return (
		<div className="table-row">
			<div className="a">
				<span>
					<a href="#">{title}}</a>
				</span>
			</div>
			<div className="b">
				<span>{author}</span>
			</div>
			<div className="c">
				<span>{comments}</span>
			</div>
			<div className="c">
				<span>{points}</span>
			</div>
			<div className="c">
				<span>
					<button onClick={()=> onRemove(id)} className="button-inline" type="button">Dismiss</button>    
				</span>
			</div>
		</div>
	);
}

const getHackerNewsList = (content) => {
	return content.map (item => <HackerNewsRow
				key = {item.objectID}
				id = {item.objectID}
				title={item.title}
				author={item.author}
				comments={item.num_comments}
				points={item.points}
				onRemove = { (id) => model.removeById(id) }
			/>
	);
}

const HackerNewsTable = ( {model} ) => {
	let contentList = null;

	console.log ('model:', model.result);

	if (model.result != null)
		contentList = getHackerNewsList(model.result);

	console.log ('contentList:', contentList);

	return (
		<div className="table">
		<div className="table-header">
			<span className="a">
				<button className="button-inline" type="button">Title</button>
			</span>
			<span className="b">
				<button className="button-inline" type="button">Author</button>
			</span>
			<span className="c">
				<button className="button-inline" type="button">Comments</button>
			</span>
			<span className="c">
				<button className="button-inline" type="button">Points</button>
			</span>
			<span className="c archive">Archive</span>
		</div>
		{model.result && contentList}

		</div>
	) ;
}
const  HackerNewsApp  = ({model}) =>  {
   return (
	   <div id="content">
		   <div className="container">

			   <SearchForm model = {model}/>

			   <HackerNewsTable model = {model} />

			   <div className="interactions">
				   <button className="btn btn-default" type="button">More</button>
			   </div>
		   </div>
	   </div>
   );
}

const model = new HackerNewsModel();

const render  = ()  => {
	ReactDOM.render(<HackerNewsApp model={model} />, document.getElementById("container"));
}
model.subscribe(render);
render();