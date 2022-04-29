class ApiFeatures {
    constructor(query, queryString) {
            this.query = query;
            this.queryString = queryString;
        }
        //! Advanced filtering
    filtering() {
            const queryObj = {...this.queryString };
            let queryStr = JSON.stringify(queryObj);
            queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
            this.query = this.query.find(JSON.parse(queryStr));
            return this;
        }
        //! Sorting
    sorting() {
            if (this.queryString.sort) {
                const sortBy = this.queryString.sort.split(',').join(' ');
                this.query = this.query.sort(sortBy);
            } else {
                this.query = this.query.sort('-createdAt');
            }
            return this;
        }
        //! Field limiting
    fieldLimiting() {
            if (this.queryString.fields) {
                const fields = this.queryString.fields.split(',').join(' ');
                this.query = this.query.select(fields);
            } else {
                this.query = this.query.select('-__v');
            }
            return this;
        }
        //! Pagination
    pagination() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}
module.exports = ApiFeatures;