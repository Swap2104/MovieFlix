export function Search({ searchTerm, setSearchTerm }) {
  return (
    <div className="search">
      <div>
        <img src="/search.svg" alt="" />

        <input
          type="text"
          name=""
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
}
