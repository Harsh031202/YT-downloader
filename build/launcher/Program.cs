using System;
using System.Diagnostics;
using System.IO;

namespace TubeFlow.Launcher
{
    static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            try
            {
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                string targetExe = Path.Combine(baseDir, "app", "TubeFlow.exe");

                if (!File.Exists(targetExe))
                {
                    targetExe = Path.Combine(baseDir, "core", "TubeFlow.exe");
                }

                if (!File.Exists(targetExe))
                {
                    targetExe = Path.Combine(baseDir, "TubeFlow.exe");
                }

                if (File.Exists(targetExe))
                {
                    ProcessStartInfo psi = new ProcessStartInfo();
                    psi.FileName = targetExe;
                    psi.WorkingDirectory = Path.GetDirectoryName(targetExe);
                    psi.WindowStyle = ProcessWindowStyle.Maximized;
                    if (args != null && args.Length > 0)
                    {
                        psi.Arguments = string.Join(" ", args);
                    }
                    psi.UseShellExecute = true;
                    Process.Start(psi);
                }
            }
            catch { }
        }
    }
}
