import { ReactElement, useContext } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import AppContext, { Status, IResults, Steps } from "../AppContext";
import JsonViewer from "../JsonViewer/JsonViewer";
import ResultCount from "./ResultCount";

const iconWidth = 30;

interface Props {
  title: string;
  step: Steps;
  results: IResults;
  children?;
}

const statusIcons = new Map<Status, ReactElement>([
  [Status.Pending, <AccessTimeFilledIcon color="info" />],
  [Status.Pass, <CheckCircleIcon color="success" />],
  [Status.Fail, <CancelIcon color="error" />],
]);

export default function TestStep(props: Props) {
  const { title, step, results, children } = props;
  const { testStepExpanded, setTestStepExpanded } = useContext(AppContext);

  const handleAccordionChange = (panel: Steps) => (
    event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setTestStepExpanded(isExpanded ? panel : false);
  };

  return (
    <Accordion
      expanded={testStepExpanded === step}
      onChange={handleAccordionChange(step)}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography sx={{ width: `${iconWidth}px`, flexShrink: 0 }}>
          {statusIcons.get(results.status)}
        </Typography>
        <>
          &nbsp;&nbsp;&nbsp;
          {title}
          <ResultCount
            label="Errors"
            color="error"
            count={results.errorCount}
          />
          <ResultCount
            label="Positives"
            color="success"
            count={results.positiveCount}
          />
          <ResultCount
            label="Negatives"
            color="warning"
            count={results.negativeCount}
          />
          <ResultCount label="Skips" color="info" count={results.skipCount} />
        </>
      </AccordionSummary>
      <AccordionDetails>
        {children}
        {results.details.map((detail, index: number) =>
          typeof detail === "string" ? (
            <Typography key={index}>{detail}</Typography>
          ) : detail instanceof File ? (
            <div key={index}>
              <p>Filename: {detail.name}</p>
              <p>Filetype: {detail.type}</p>
              <p>Size in bytes: {detail.size}</p>
              <p>
                Last modified date:{" "}
                {new Date(detail.lastModified).toLocaleString("en-US")}
              </p>
            </div>
          ) : (
            <JsonViewer key={index} src={detail} height="50vh" />
          )
        )}
      </AccordionDetails>
    </Accordion>
  );
}
