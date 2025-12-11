import { ClassStatisticType } from "@/lib/gpaCalculator/types";

type Props = {
  classStatistic: ClassStatisticType;
  setClassInfo: React.Dispatch<React.SetStateAction<string>>;
};

const ClassInfo = (props: Props): JSX.Element => {
  const classStat = props.classStatistic;
  const tableCols = ["Course", "Number", "Description", "Grade", "Units"];
  return (
    <div className="grid justify-items-stretch pb-1">
      <div className="border-2 py-1 rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
        <div className="grid grid-flow-col">
          <div> </div>
          <h1 className="text-center justify-self-stretch font-bold">
            {classStat.name}
          </h1>
          <div
            className="justify-self-end hover:cursor-pointer pr-4"
            onClick={() => props.setClassInfo("")}
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
                {classStat.classes.map((classObj) => {
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
              {classStat.name} had an average GPA of:{" "}
              {classStat.gpa.toFixed(2)}
            </p>
            <p>
              {classStat.name} had {classStat.unitsTaken.toFixed(2)} units
              taken in total
            </p>
            <p>
              {classStat.name} had {classStat.gradePoints.toFixed(2)} grade
              points in total
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassInfo;
