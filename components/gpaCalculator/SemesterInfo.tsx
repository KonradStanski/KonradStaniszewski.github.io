import { SemesterType } from "@/lib/gpaCalculator/types";

type Props = {
  semester: SemesterType;
  setSemesterInfo: React.Dispatch<React.SetStateAction<string>>;
};

const SemesterInfo = (props: Props): JSX.Element => {
  const semester = props.semester;
  const tableCols = ["Course", "Number", "Description", "Grade", "Units"];
  return (
    <div className="grid justify-items-stretch pb-1">
      <div className="border-2 py-1 rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
        <div className="grid grid-flow-col">
          <div> </div>
          <h1 className="text-center justify-self-stretch font-bold">
            {semester.name}
          </h1>
          <div
            className="justify-self-end hover:cursor-pointer pr-4"
            onClick={() => props.setSemesterInfo("")}
          >
            <span className="text-2xl">&times;</span>
          </div>
        </div>
        <div className="flex flex-col md:flex-row m-4 gap-4">
          <div className="overflow-x-auto">
            <table className="table-auto border-collapse">
              <thead>
                <tr>
                  {tableCols.map((col) => {
                    return (
                      <th
                        key={col}
                        className="border border-gray-300 dark:border-gray-600 p-2"
                      >
                        {col}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {semester.classes.map((classObj) => {
                  return (
                    <tr key={classObj.course + classObj.number}>
                      <td className="border border-gray-300 dark:border-gray-600 p-2">
                        {classObj.course}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2">
                        {classObj.number}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2">
                        {classObj.desc}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2">
                        {classObj.remarkStr}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2">
                        {classObj.unitsTaken}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="text-sm space-y-1">
            <p>
              This semester&apos;s total units:{" "}
              {semester.totalUnitsTaken.toFixed(2)}
            </p>
            <p>
              This semester&apos;s total grade points:{" "}
              {semester.totalGradePoints.toFixed(2)}
            </p>
            <p>
              Your cumulative units taken:{" "}
              {semester.cumulativeUnitsTaken.toFixed(2)}
            </p>
            <p>
              Your cumulative grade points:{" "}
              {semester.cumulativeGradePoints.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SemesterInfo;
