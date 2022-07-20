import {
  Paper,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Collapse,
  Box
} from '@mui/material';
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Refresh,
} from '@mui/icons-material';
import { createDockerDesktopClient } from '@docker/extension-api-client';
import React, { useEffect, useState } from 'react';
import { ContainerHealthCheckInfo, HealthCheckEntry } from './ContainerHealthCheckInfo';

export function App() {
  const ddClient = createDockerDesktopClient();
  const [containerHealthCheckInfoList, setContainerHealthCheckInfoList] = useState<ContainerHealthCheckInfo[]>([]);

  async function getContainerHealthCheckInfoList() {
    ddClient.docker.cli.exec('container', [
      'ls',
      '-a',
      '--format',
      '"{{json .}}"',
    ]).then(async (containerList) => {
      let json = containerList.parseJsonLines();
      let containerHealthCheckInfos: ContainerHealthCheckInfo[] = [];
      for (let container of json) {
        let healthCheckInfo = await ddClient.docker.cli.exec('inspect', [
          container.ID,
          '--format',
          '"{{json .State.Health}}"',
        ]);
        let healthCheckJson = healthCheckInfo.parseJsonObject();
        if (healthCheckJson != null) {
          let containerInfo: ContainerHealthCheckInfo = {
            Name: container.Names,
            ID: container.ID,
            ContainerStatus: container.Status,
            Status: healthCheckJson.Status,
            FailingStreak: healthCheckJson.FailingStreak,
            Log: healthCheckJson.Log,
          };
          containerHealthCheckInfos.push(containerInfo);
        }
      }
      setContainerHealthCheckInfoList(containerHealthCheckInfos);
    });
  }

  useEffect(() => {
    getContainerHealthCheckInfoList();
  }, []);

  function Row(props: { row: ContainerHealthCheckInfo }) {
    const { row } = props;
    const [open, setOpen] = useState(false);

    return (
      <React.Fragment>
        <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
          <TableCell>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </TableCell>
          <TableCell component="th" scope="row">
            {row.Name}
          </TableCell>
          <TableCell>{row.ID}</TableCell>
          <TableCell>{row.ContainerStatus}</TableCell>
          <TableCell>{row.FailingStreak}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Typography variant="h6" gutterBottom component="div">
                  Log
                </Typography>
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow>
                      <TableCell>Start</TableCell>
                      <TableCell>End</TableCell>
                      <TableCell>Exit Code</TableCell>
                      <TableCell>Output</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.Log.map((healthCheckLog) => (
                      <TableRow key={healthCheckLog.Start}>
                        <TableCell component="th" scope="row">{new Date(healthCheckLog.Start).toLocaleString()}</TableCell>
                        <TableCell>{new Date(healthCheckLog.End).toLocaleString()}</TableCell>
                        <TableCell>{healthCheckLog.ExitCode}</TableCell>
                        <TableCell>{healthCheckLog.Output}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  }

  return (
    <Stack
      display="flex"
      flexGrow={1}
      justifyContent="flex-start"
      alignItems="flex-start"
      height="100%"
    >
      <Typography variant="h2">Healthchecks</Typography>
      <Typography variant="caption" color="secondary">View Dockerfile HEALTHCHECK results from running containers</Typography>
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell>
                <IconButton onClick={getContainerHealthCheckInfoList}>
                  <Refresh />
                </IconButton>
              </TableCell>
              <TableCell>Name</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Failing Streak</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {containerHealthCheckInfoList.map((container: ContainerHealthCheckInfo) => (
              <Row key={container.ID} row={container} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}
