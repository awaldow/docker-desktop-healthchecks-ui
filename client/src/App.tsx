import {
  Paper,
  Button,
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
} from '@mui/icons-material';
import { createDockerDesktopClient } from '@docker/extension-api-client';
import React, { useEffect, useState } from 'react';
import { ContainerHealthCheckInfo, HealthCheckEntry } from './ContainerHealthCheckInfo';

export function App() {
  const ddClient = createDockerDesktopClient();
  const [containerHealthCheckInfoList, setContainerHealthCheckInfoList] = useState<ContainerHealthCheckInfo[]>([]);

  async function getContainerHealthCheckInfoList() { 
    const containers = await ddClient.docker.cli.exec('container', [
      'ls',
      '-a',
      '--format',
      '"{{json .}}"',
    ]);
    let json = await containers.parseJsonLines();
    const containerHealthCheckInfos: ContainerHealthCheckInfo[] = [];
    json.forEach(async (container: any) => {
      let healthCheck = await ddClient.docker.cli.exec('inspect', [
        container.ID,
        '--format',
        '"{{json .State.Health}}"',
      ]);
      let healthCheckJson = await healthCheck.parseJsonObject();
      if (healthCheckJson != null) {
        let containerInfo: ContainerHealthCheckInfo = {
          Name: container.Names,
          ID: container.ID,
          ContainerStatus: container.Status,
          Status: healthCheckJson.Status,
          FailingStreak: healthCheckJson.FailingStreak,
          Log: healthCheckJson.Log,
        };
        console.log('adding container to containerHealthCheckInfos: ' + containerInfo);
        containerHealthCheckInfos.push(containerInfo);
      }
    });
    console.log(containerHealthCheckInfos.length);
    setContainerHealthCheckInfoList(containerHealthCheckInfos);
  }

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
          <TableCell align="right">{row.ID}</TableCell>
          <TableCell align="right">{row.ContainerStatus}</TableCell>
          <TableCell align="right">{row.FailingStreak}</TableCell>
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
                        <TableCell component="th" scope="row">{healthCheckLog.Start}</TableCell>
                        <TableCell>{healthCheckLog.End}</TableCell>
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

  console.log(containerHealthCheckInfoList);

  return (
    <Stack
      display="flex"
      flexGrow={1}
      justifyContent="center"
      alignItems="center"
      height="100vh"
    >
      <Button variant="contained" onClick={getContainerHealthCheckInfoList}>
        Get Health Check Info
      </Button>
      {containerHealthCheckInfoList ? (
        <TableContainer component={Paper}>
          <Table aria-label="">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Name</TableCell>
                <TableCell align="right">ID</TableCell>
                <TableCell align="right">Status</TableCell>
                <TableCell align="right">Failing Streak</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {containerHealthCheckInfoList.map((container: ContainerHealthCheckInfo) => (
                <Row key={container.Name} row={container} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        ''
      )}
    </Stack>
  );
}
