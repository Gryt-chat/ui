import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Progress,
  Radio,
  Select,
  Skeleton,
  Slider,
  Spinner,
  Switch,
  Tab,
  Tabs,
  Tooltip
} from "@gryt/ui";
import { Bell, ChevronDown, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Preview } from "../components/Preview";

export function ComponentsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  return (
    <article className="prose prose-invert max-w-none">
      <h1>Components</h1>
      <p>
        Common MUI components wrapped with Gryt color, radius, and surface
        conventions.
      </p>

      <h2>Inputs</h2>
      <Preview>
        <div className="grid gap-5 md:grid-cols-2">
          <Select
            label="Input device"
            defaultValue="studio"
            options={[
              { label: "Studio mic", value: "studio" },
              { label: "Headset", value: "headset" }
            ]}
          />
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Checkbox defaultChecked aria-label="Enable noise suppression" />
              <Switch defaultChecked aria-label="Voice activity" />
              <Radio defaultChecked aria-label="Selected channel" />
            </div>
            <Slider defaultValue={64} aria-label="Input volume" />
          </div>
        </div>
      </Preview>

      <h2>Data Display</h2>
      <Preview>
        <div className="flex flex-wrap items-center gap-4">
          <Badge badgeContent={3}>
            <Avatar>G</Avatar>
          </Badge>
          <Chip label="Connected" />
          <Chip label="Beta" color="primary" />
          <Tooltip title="Notifications">
            <IconButton aria-label="Notifications">
              <Bell size={18} />
            </IconButton>
          </Tooltip>
        </div>
      </Preview>

      <h2>Surfaces</h2>
      <Preview>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader title="Server status" subheader="Gryt voice region" />
            <CardContent>
              Latency stable. Voice activity detection active.
            </CardContent>
            <CardActions>
              <Button size="small">Open</Button>
              <Button tone="neutral" size="small">
                Details
              </Button>
            </CardActions>
          </Card>
          <div className="space-y-4">
            <Alert severity="success">Connected to Gryt.</Alert>
            <Progress variant="determinate" value={72} />
            <div className="flex items-center gap-4">
              <Spinner size={24} />
              <Skeleton variant="rounded" width={180} height={36} />
            </div>
          </div>
        </div>
      </Preview>

      <h2>Navigation</h2>
      <Preview>
        <div className="space-y-5">
          <Tabs value={0} aria-label="Component tabs">
            <Tab label="Chat" />
            <Tab label="Voice" />
            <Tab label="Files" />
          </Tabs>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ChevronDown size={18} />}>
              Voice settings
            </AccordionSummary>
            <AccordionDetails>
              Input, output, threshold, and suppression controls belong here.
            </AccordionDetails>
          </Accordion>
        </div>
      </Preview>

      <h2>Overlays</h2>
      <Preview>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setDialogOpen(true)}>Open dialog</Button>
          <IconButton
            aria-label="Open menu"
            onClick={(event) => setMenuAnchor(event.currentTarget)}
          >
            <MoreHorizontal size={18} />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            <MenuItem onClick={() => setMenuAnchor(null)}>Edit server</MenuItem>
            <MenuItem onClick={() => setMenuAnchor(null)}>
              Invite people
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => setMenuAnchor(null)}>Leave</MenuItem>
          </Menu>
          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
            <DialogTitle>Join Gryt server?</DialogTitle>
            <DialogContent>
              Rounded, themed MUI dialog with Gryt surface and border treatment.
            </DialogContent>
            <DialogActions>
              <Button tone="neutral" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setDialogOpen(false)}>Join</Button>
            </DialogActions>
          </Dialog>
        </div>
      </Preview>
    </article>
  );
}
