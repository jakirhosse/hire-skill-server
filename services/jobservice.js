const { JobModel } = require("../../models/job-model/job.model");
// create comment by blog
const createJobService = async (req, payload) => {
  // save to the database
  const response = JobModel.create(payload);
  // const insert = await executeQuery(req.pool, query, values);
  if (response) {
    return response;
  }
  return false;
};

// get all jobs by paginated and filter
const getJobListsService = async (
  limit,
  skip,
  search,
  filters,
  sortField = "createdAt",
  sortOrder = "desc"
) => {
  try {
    let query = {};
    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }];
    }
    // apply filters if they are provided
    if (filters) {
      if (filters.experienceLevel) {
        query.experienceLevel = filters.experienceLevel;
      }
      if (filters.employmentType) {
        query.employmentType = filters.employmentType;
      }
      if (filters.jobType) {
        query.jobType = filters.jobType;
      }
    }

    // Determine sort order
    const sort = {};
    sort[sortField] = sortOrder?.toLowerCase() === "asc" ? 1 : -1;
    const totalItems = await JobModel.countDocuments(filters);
    const res = await JobModel.aggregate([
      { $match: query },
      { $sort: sort },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          // totalCount: [{ $count: "value" }],
        },
      },
    ]);
    if (res) {
      return {
        data: res[0].data,
        totalItems,
        isSuccess: true,
        message: "jobs retrieved successfully",
      };
    }
  } catch (error) {
    return {
      isSuccess: false,
      message: error.message,
    };
  }
};

//get single job by job id
const getSingleJobService = async (id) => {
  try {
    const job = await JobModel.findById(id);

    if (!job) {
      // Handle case where job with given id is not found
      return null;
    }

    return job;
  } catch (error) {
    console.error("Error in getSingleJobService:", error);
    throw error;
  }
};

// get job title for job search suggestion
const getJobAllJobTitle = async (req, res) => {
  const query = getPropertyQuery("title, tags", "jobs");
  const result = await getData(req.pool, query);
  return result;
};
