/* eslint-disable no-console */
import React from "react";
import { Bar } from "react-chartjs-2";
import { TranscriptInfoType } from "../../../types/gpaCalculatorTypes";
import { clamp } from "@app/utils/utilFunc";

type props = {
    transcriptInfo: TranscriptInfoType;
    theme: string;
    setClassInfo: React.Dispatch<React.SetStateAction<string>>;
    classInfo: string;
};

const ClassChart = (props: props): JSX.Element => {
    const transcript = props.transcriptInfo;
    props.transcriptInfo.classStatistics.sort((a, b) => a.gpa - b.gpa);
    const theme = props.theme;
    const maxGpa = 4.0; //Math.max(...props.transcriptInfo.classStatistics.map(classStat => classStat.gpa));
    const minGpa = 2.0; //Math.min(...props.transcriptInfo.classStatistics.map(classStat => classStat.gpa));
    const data = {
        labels: transcript.classStatistics.map((classStat) => classStat.name),
        datasets: [
            {
                type: "bar",
                label: "GPA [2.0 - 4.0]",
                data: transcript.classStatistics.map((classStat) => classStat.unitsTaken),
                borderColor: "rgb(0,0,0)",
                backgroundColor: props.transcriptInfo.classStatistics.map((classStat) => {
                    const greenVal = clamp(0, 255, (classStat.gpa - minGpa) * (255 / (maxGpa - minGpa)));
                    const redVal = clamp(0, 255, 255 - (classStat.gpa - minGpa) * (255 / (maxGpa - minGpa)));
                    return `rgba(${redVal}, ${greenVal}, 0, ${theme === "dark" ? "0.7" : "0.4"})`;
                }),
            },
        ],
    };

    let maxLeft = 0;
    function generateLabelsNew(chart) {
        const datasets = chart.data.datasets;
        const {
            labels: { usePointStyle, pointStyle, textAlign, color },
        } = chart.legend.options;

        return chart._getSortedDatasetMetas().map((meta) => {
            const style = meta.controller.getStyle(usePointStyle ? 0 : undefined);
            const borderWidth = style.borderWidth;

            const box = chart?.legend?.legendHitBoxes[meta.index];
            if (box?.left > maxLeft) {
                maxLeft = box.left;
            }
            const gradient = chart.ctx.createLinearGradient(maxLeft, 0, maxLeft + 50, 0);
            gradient.addColorStop(0, "rgba(0, 255, 0, 0.4)");
            gradient.addColorStop(1, "rgba(255, 0, 0, 0.4)");

            return {
                text: datasets[meta.index].label,
                fillStyle: datasets[meta.index].label === "GPA [2.0 - 4.0]" ? gradient : style.backgroundColor,
                fontColor: color,
                hidden: !meta.visible,
                lineCap: style.borderCapStyle,
                lineDash: style.borderDash,
                lineDashOffset: style.borderDashOffset,
                lineJoin: style.borderJoinStyle,
                lineWidth: (borderWidth.width + borderWidth.height) / 4,
                strokeStyle: style.borderColor,
                pointStyle: pointStyle || style.pointStyle,
                rotation: style.rotation,
                textAlign: textAlign || style.textAlign,
                borderRadius: 0,
                datasetIndex: meta.index,
            };
        }, this);
    }

    const handleClick = (_event: MouseEvent, array) => {
        const index = array[0]?.index;
        const label = data.labels[index];
        if (props.classInfo === label) {
            props.setClassInfo("");
        } else {
            props.setClassInfo(label);
        }
    };

    const themeColor = theme === "dark" ? "white" : "black";
    const options = {
        animation: {
            duration: 0,
        },
        onClick: handleClick,
        interaction: {
            intersect: false,
        },
        scales: {
            y: {
                title: {
                    color: themeColor,
                    display: true,
                    text: "Units Taken",
                },
                ticks: {
                    color: themeColor,
                },
                grid: {
                    color: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                },
                min: 0,
            },
            x: {
                ticks: {
                    color: themeColor,
                },
                grid: {
                    display: false,
                },
            },
        },
        plugins: {
            title: {
                display: true,
                color: themeColor,
                font: {
                    size: 16,
                    weight: "bold",
                },
                text: "Units Taken Per Class Type",
            },
            tooltip: {
                callbacks: {
                    footer: (elem) => {
                        return `GPA: ${props.transcriptInfo.classStatistics[elem[0].dataIndex].gpa.toFixed(1)}`;
                    },
                },
            },
            legend: {
                position: "top",
                labels: {
                    textAlign: "left",
                    boxWidth: 50,
                    generateLabels: generateLabelsNew,
                    color: themeColor,
                },
            },
        },
    };

    return <Bar className="hover:cursor-pointer" data={data} options={options} />;
};

export default ClassChart;
