import { useContext } from "react";
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
import { Badge } from "@mui/material";

const iconWidth = 30;

interface Props {
  title: string;
  step: Steps;
  results: IResults;
  children?;
}

const statusIcons = new Map<Status, object>([
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
          {"badgeCount" in results ? (
            <Badge badgeContent={results.badgeCount} color="error">
              {statusIcons.get(results.status)}
            </Badge>
          ) : (
            statusIcons.get(results.status)
          )}
        </Typography>
        <Typography>
          &nbsp;&nbsp;&nbsp;
          {title}
        </Typography>
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
            <JsonViewer
              key={index}
              src={JSON.stringify(detail, null, "  ")}
              height="50vh"
            />
          )
        )}
      </AccordionDetails>
    </Accordion>
  );
}