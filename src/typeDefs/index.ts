import { fileLoader, mergeTypes } from "merge-graphql-schemas";
import * as path from "path";

const typesArray = fileLoader(path.join(__dirname, "./"));
const typesMerged = mergeTypes(typesArray);

export default typesMerged;
