using System;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.IO;
using System.Threading;
using System.Windows.Forms;
using Microsoft.Win32;

namespace TubeFlow.Uninstaller
{
    static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            string targetDir = null;
            if (args != null)
            {
                foreach (string arg in args)
                {
                    if (arg.StartsWith("--target=", StringComparison.OrdinalIgnoreCase))
                    {
                        targetDir = arg.Substring("--target=".Length).Trim('"');
                    }
                }
            }

            string exePath = Application.ExecutablePath;
            string currentDir = Path.GetDirectoryName(exePath);

            // If we are running inside the installed directory, copy ourselves to %TEMP%
            // and re-launch from there so the installation directory is not locked during deletion.
            if (string.IsNullOrEmpty(targetDir))
            {
                try
                {
                    string tempExe = Path.Combine(Path.GetTempPath(), "TubeFlow-Uninstaller-Run.exe");
                    File.Copy(exePath, tempExe, true);

                    ProcessStartInfo psi = new ProcessStartInfo();
                    psi.FileName = tempExe;
                    psi.Arguments = "--target=\"" + currentDir + "\"";
                    psi.UseShellExecute = true;
                    psi.Verb = "runas"; // Prompts for Administrator elevation
                    Process.Start(psi);
                    return; // Exit in-place instance immediately
                }
                catch
                {
                    // Fall back to running directly if temp copy fails
                }
            }

            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new UninstallerForm(targetDir ?? currentDir));
        }
    }

    public class UninstallerForm : Form
    {
        private string appInstallDir;
        private int selectedMode = 1; // 1 = Standard, 2 = Clean, 3 = Total
        private RadioButton rbStandard;
        private RadioButton rbClean;
        private RadioButton rbTotal;
        private Panel card1;
        private Panel card2;
        private Panel card3;
        private CheckBox cbConfirmTotal;
        private ProgressBar progressBar;
        private Label lblStatus;
        private Button btnUninstall;
        private Button btnCancel;

        private Color bgMain = ColorTranslator.FromHtml("#F5F6FA");
        private Color cardBg = Color.White;
        private Color coralRed = ColorTranslator.FromHtml("#E94E58");
        private Color textPrimary = ColorTranslator.FromHtml("#1A1D1F");
        private Color textMuted = ColorTranslator.FromHtml("#6F767E");
        private Color borderColor = ColorTranslator.FromHtml("#ECEEF2");

        public UninstallerForm(string targetDir)
        {
            this.appInstallDir = targetDir;
            InitializeComponent();
            SelectMode(1);
        }

        private void InitializeComponent()
        {
            this.Text = "TubeFlow Uninstaller Setup";
            this.Size = new Size(620, 680);
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.StartPosition = FormStartPosition.CenterScreen;
            this.MaximizeBox = false;
            this.MinimizeBox = true;
            this.BackColor = bgMain;
            this.Font = new Font("Segoe UI", 9F, FontStyle.Regular);

            // Header Container
            Panel pnlHeader = new Panel();
            pnlHeader.Dock = DockStyle.Top;
            pnlHeader.Height = 85;
            pnlHeader.BackColor = Color.White;
            pnlHeader.Paint += (s, e) =>
            {
                using (Pen pen = new Pen(borderColor, 1))
                {
                    e.Graphics.DrawLine(pen, 0, pnlHeader.Height - 1, pnlHeader.Width, pnlHeader.Height - 1);
                }
            };

            // Header Red Icon Badge
            Panel iconBadge = new Panel();
            iconBadge.Size = new Size(44, 44);
            iconBadge.Location = new Point(24, 20);
            iconBadge.BackColor = ColorTranslator.FromHtml("#FEECEE");
            iconBadge.Paint += (s, e) =>
            {
                e.Graphics.SmoothingMode = SmoothingMode.AntiAlias;
                using (SolidBrush brush = new SolidBrush(coralRed))
                {
                    e.Graphics.FillRectangle(brush, 12, 16, 20, 18);
                    e.Graphics.FillRectangle(brush, 9, 13, 26, 3);
                    e.Graphics.FillRectangle(brush, 18, 9, 8, 4);
                }
            };
            pnlHeader.Controls.Add(iconBadge);

            Label lblTitle = new Label();
            lblTitle.Text = "TubeFlow Uninstaller Setup";
            lblTitle.Font = new Font("Segoe UI", 13.5F, FontStyle.Bold);
            lblTitle.ForeColor = textPrimary;
            lblTitle.Location = new Point(80, 18);
            lblTitle.AutoSize = true;
            pnlHeader.Controls.Add(lblTitle);

            Label lblSubtitle = new Label();
            lblSubtitle.Text = "Choose how thoroughly you want to remove TubeFlow from this system";
            lblSubtitle.Font = new Font("Segoe UI", 9F, FontStyle.Regular);
            lblSubtitle.ForeColor = textMuted;
            lblSubtitle.Location = new Point(80, 44);
            lblSubtitle.AutoSize = true;
            pnlHeader.Controls.Add(lblSubtitle);

            this.Controls.Add(pnlHeader);

            // Content Panel
            Panel pnlContent = new Panel();
            pnlContent.Location = new Point(24, 100);
            pnlContent.Size = new Size(556, 450);
            pnlContent.BackColor = Color.Transparent;

            Label lblChoose = new Label();
            lblChoose.Text = "SELECT UNINSTALLATION LEVEL";
            lblChoose.Font = new Font("Segoe UI", 7.5F, FontStyle.Bold);
            lblChoose.ForeColor = ColorTranslator.FromHtml("#8C93A0");
            lblChoose.Location = new Point(4, 4);
            lblChoose.AutoSize = true;
            pnlContent.Controls.Add(lblChoose);

            // Card 1: Standard
            card1 = CreateModeCard(
                1,
                20,
                "1. Remove this app only (Standard Uninstall)",
                "Removes TubeFlow app files, runtime, and desktop/start shortcuts.\nKeeps downloaded videos, yt-dlp, FFmpeg, and caches intact.",
                out rbStandard
            );
            pnlContent.Controls.Add(card1);

            // Card 2: Clean Uninstall
            card2 = CreateModeCard(
                2,
                115,
                "2. Clean uninstall (App + yt-dlp + FFmpeg + Libraries + Caches)",
                "Removes app binaries, yt-dlp, FFmpeg, caches, history, and configs.\nPreserves all your downloaded video and audio files.",
                out rbClean
            );
            pnlContent.Controls.Add(card2);

            // Card 3: Total Removal
            card3 = CreateModeCard(
                3,
                210,
                "3. Total removal (Complete purge including all downloaded media)",
                "WARNING: Completely wipes EVERYTHING including all downloaded\nvideos and audio files inside your TubeFlow downloads folder!",
                out rbTotal
            );
            pnlContent.Controls.Add(card3);

            // Confirmation checkbox for Total Removal
            cbConfirmTotal = new CheckBox();
            cbConfirmTotal.Text = "I understand this will permanently delete all my downloaded videos and audio.";
            cbConfirmTotal.Font = new Font("Segoe UI", 8.5F, FontStyle.Bold);
            cbConfirmTotal.ForeColor = coralRed;
            cbConfirmTotal.Location = new Point(28, 305);
            cbConfirmTotal.Size = new Size(520, 24);
            cbConfirmTotal.Visible = false;
            cbConfirmTotal.Cursor = Cursors.Hand;
            pnlContent.Controls.Add(cbConfirmTotal);

            // Status label & Progress Bar
            lblStatus = new Label();
            lblStatus.Text = "Ready to uninstall.";
            lblStatus.Font = new Font("Segoe UI", 8.5F, FontStyle.Regular);
            lblStatus.ForeColor = textMuted;
            lblStatus.Location = new Point(4, 345);
            lblStatus.Size = new Size(545, 20);
            pnlContent.Controls.Add(lblStatus);

            progressBar = new ProgressBar();
            progressBar.Location = new Point(4, 370);
            progressBar.Size = new Size(545, 14);
            progressBar.Style = ProgressBarStyle.Continuous;
            progressBar.Value = 0;
            pnlContent.Controls.Add(progressBar);

            this.Controls.Add(pnlContent);

            // Bottom Buttons Container
            Panel pnlBottom = new Panel();
            pnlBottom.Dock = DockStyle.Bottom;
            pnlBottom.Height = 75;
            pnlBottom.BackColor = Color.White;
            pnlBottom.Paint += (s, e) =>
            {
                using (Pen pen = new Pen(borderColor, 1))
                {
                    e.Graphics.DrawLine(pen, 0, 0, pnlBottom.Width, 0);
                }
            };

            btnCancel = new Button();
            btnCancel.Text = "Cancel";
            btnCancel.Size = new Size(110, 40);
            btnCancel.Location = new Point(320, 18);
            btnCancel.FlatStyle = FlatStyle.Flat;
            btnCancel.FlatAppearance.BorderColor = borderColor;
            btnCancel.BackColor = Color.White;
            btnCancel.ForeColor = textPrimary;
            btnCancel.Font = new Font("Segoe UI", 9F, FontStyle.Bold);
            btnCancel.Cursor = Cursors.Hand;
            btnCancel.Click += (s, e) => this.Close();
            pnlBottom.Controls.Add(btnCancel);

            btnUninstall = new Button();
            btnUninstall.Text = "Uninstall TubeFlow";
            btnUninstall.Size = new Size(160, 40);
            btnUninstall.Location = new Point(440, 18);
            btnUninstall.FlatStyle = FlatStyle.Flat;
            btnUninstall.FlatAppearance.BorderSize = 0;
            btnUninstall.BackColor = coralRed;
            btnUninstall.ForeColor = Color.White;
            btnUninstall.Font = new Font("Segoe UI", 9F, FontStyle.Bold);
            btnUninstall.Cursor = Cursors.Hand;
            btnUninstall.Click += BtnUninstall_Click;
            pnlBottom.Controls.Add(btnUninstall);

            this.Controls.Add(pnlBottom);
        }

        private void SelectMode(int mode)
        {
            selectedMode = mode;

            // Strict mutual exclusivity
            rbStandard.Checked = (mode == 1);
            rbClean.Checked = (mode == 2);
            rbTotal.Checked = (mode == 3);

            // Update card background colors
            card1.BackColor = (mode == 1) ? ColorTranslator.FromHtml("#F9FAFB") : cardBg;
            card2.BackColor = (mode == 2) ? ColorTranslator.FromHtml("#F9FAFB") : cardBg;
            card3.BackColor = (mode == 3) ? ColorTranslator.FromHtml("#FFF5F5") : cardBg;

            // Redraw borders
            card1.Invalidate();
            card2.Invalidate();
            card3.Invalidate();

            // Toggle Total confirmation checkbox
            cbConfirmTotal.Visible = (mode == 3);
            if (mode != 3)
            {
                cbConfirmTotal.Checked = false;
            }
        }

        private Panel CreateModeCard(int mode, int top, string title, string desc, out RadioButton rb)
        {
            Panel card = new Panel();
            card.Location = new Point(4, top);
            card.Size = new Size(545, 82);
            card.BackColor = cardBg;
            card.Cursor = Cursors.Hand;

            card.Paint += (s, e) =>
            {
                bool isSelected = (selectedMode == mode);
                Color penColor = isSelected ? (mode == 3 ? coralRed : textPrimary) : borderColor;
                int penWidth = isSelected ? 2 : 1;
                using (Pen pen = new Pen(penColor, penWidth))
                {
                    e.Graphics.DrawRectangle(pen, 0, 0, card.Width - 1, card.Height - 1);
                }
            };

            rb = new RadioButton();
            rb.Location = new Point(16, 14);
            rb.Size = new Size(22, 22);
            rb.AutoCheck = false;
            rb.Cursor = Cursors.Hand;
            rb.Click += (s, e) => SelectMode(mode);
            card.Controls.Add(rb);

            Label lblTitle = new Label();
            lblTitle.Text = title;
            lblTitle.Font = new Font("Segoe UI", 9.5F, FontStyle.Bold);
            lblTitle.ForeColor = textPrimary;
            lblTitle.Location = new Point(42, 12);
            lblTitle.Size = new Size(490, 20);
            lblTitle.Cursor = Cursors.Hand;
            lblTitle.Click += (s, e) => SelectMode(mode);
            card.Controls.Add(lblTitle);

            Label lblDesc = new Label();
            lblDesc.Text = desc;
            lblDesc.Font = new Font("Segoe UI", 8.25F, FontStyle.Regular);
            lblDesc.ForeColor = textMuted;
            lblDesc.Location = new Point(42, 34);
            lblDesc.Size = new Size(490, 40);
            lblDesc.Cursor = Cursors.Hand;
            lblDesc.Click += (s, e) => SelectMode(mode);
            card.Controls.Add(lblDesc);

            card.Click += (s, e) => SelectMode(mode);

            return card;
        }

        private void BtnUninstall_Click(object sender, EventArgs e)
        {
            if (selectedMode == 3 && !cbConfirmTotal.Checked)
            {
                MessageBox.Show(
                    "Please check the confirmation box to verify you want to delete all downloaded videos and audio.",
                    "Confirmation Required",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Warning
                );
                return;
            }

            if (selectedMode == 3)
            {
                DialogResult dr = MessageBox.Show(
                    "TOTAL REMOVAL CONFIRMATION:\n\nThis will permanently delete ALL videos, music, and media downloaded with TubeFlow.\n\nAre you sure you want to proceed?",
                    "Warning: Total Purge",
                    MessageBoxButtons.YesNo,
                    MessageBoxIcon.Stop
                );
                if (dr != DialogResult.Yes) return;
            }

            rbStandard.Enabled = false;
            rbClean.Enabled = false;
            rbTotal.Enabled = false;
            card1.Enabled = false;
            card2.Enabled = false;
            card3.Enabled = false;
            cbConfirmTotal.Enabled = false;
            btnUninstall.Enabled = false;
            btnCancel.Enabled = false;

            Thread worker = new Thread(ExecuteUninstall);
            worker.IsBackground = true;
            worker.Start();
        }

        private void UpdateProgress(int value, string message)
        {
            if (this.InvokeRequired)
            {
                this.Invoke(new Action<int, string>(UpdateProgress), value, message);
                return;
            }
            progressBar.Value = Math.Min(100, Math.Max(0, value));
            lblStatus.Text = message;
        }

        private void ExecuteUninstall()
        {
            try
            {
                UpdateProgress(10, "Closing running TubeFlow and engine processes...");
                KillProcess("TubeFlow");
                KillProcess("yt-dlp");
                KillProcess("ffmpeg");
                Thread.Sleep(800);

                string userProfile = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
                string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                string desktop = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
                string commonStartMenu = Environment.GetFolderPath(Environment.SpecialFolder.CommonStartMenu);
                string userStartMenu = Environment.GetFolderPath(Environment.SpecialFolder.StartMenu);

                string downloadDir = Path.Combine(userProfile, @"Downloads\TubeFlow");
                string appDataTubeFlow = Path.Combine(appData, "TubeFlow");
                string localAppDataTubeFlow = Path.Combine(localAppData, "TubeFlow");
                string updaterDir = Path.Combine(localAppData, "tubeflow-updater");
                string historyFile1 = Path.Combine(appData, "tubeflow-downloads-history.json");
                string historyFile2 = Path.Combine(localAppData, "tubeflow-downloads-history.json");

                UpdateProgress(25, "Removing desktop and start menu shortcuts...");
                SafeDeleteFile(Path.Combine(desktop, "TubeFlow.lnk"));
                SafeDeleteFile(Path.Combine(userStartMenu, @"Programs\TubeFlow.lnk"));
                SafeDeleteFile(Path.Combine(commonStartMenu, @"Programs\TubeFlow.lnk"));
                SafeDeleteDirectory(Path.Combine(userStartMenu, @"Programs\TubeFlow"));
                SafeDeleteDirectory(Path.Combine(commonStartMenu, @"Programs\TubeFlow"));

                bool isCleanOrTotal = (selectedMode == 2 || selectedMode == 3);
                bool isTotal = (selectedMode == 3);

                if (isCleanOrTotal)
                {
                    UpdateProgress(40, "Removing configuration, history, and cache directories...");
                    SafeDeleteDirectory(appDataTubeFlow);
                    SafeDeleteDirectory(localAppDataTubeFlow);
                    SafeDeleteDirectory(updaterDir);
                    SafeDeleteFile(historyFile1);
                    SafeDeleteFile(historyFile2);

                    UpdateProgress(55, "Removing backend engines & cache...");
                    if (!string.IsNullOrEmpty(appInstallDir))
                    {
                        string binDir = Path.Combine(appInstallDir, "bin");
                        string resBinDir = Path.Combine(appInstallDir, @"resources\bin");
                        string appResBinDir = Path.Combine(appInstallDir, @"app\resources\bin");
                        SafeDeleteDirectory(binDir);
                        SafeDeleteDirectory(resBinDir);
                        SafeDeleteDirectory(appResBinDir);
                    }
                }

                if (isTotal)
                {
                    UpdateProgress(70, "Purging all downloaded videos and audio...");
                    if (Directory.Exists(downloadDir))
                    {
                        SafeDeleteDirectory(downloadDir);
                    }
                }

                UpdateProgress(85, "Removing application files from disk...");
                if (!string.IsNullOrEmpty(appInstallDir) && Directory.Exists(appInstallDir))
                {
                    // Recursively delete installation folder
                    SafeDeleteDirectory(appInstallDir);
                }

                // Remove Windows Registry uninstall entries
                UpdateProgress(95, "Cleaning Windows Registry entries...");
                RemoveRegistryKey(Registry.LocalMachine, @"Software\Microsoft\Windows\CurrentVersion\Uninstall\TubeFlow");
                RemoveRegistryKey(Registry.LocalMachine, @"Software\Microsoft\Windows\CurrentVersion\Uninstall\com.tubeflow.app");
                RemoveRegistryKey(Registry.CurrentUser, @"Software\Microsoft\Windows\CurrentVersion\Uninstall\TubeFlow");
                RemoveRegistryKey(Registry.CurrentUser, @"Software\Microsoft\Windows\CurrentVersion\Uninstall\com.tubeflow.app");

                UpdateProgress(100, "Uninstallation completed successfully!");

                this.Invoke(new Action(() =>
                {
                    string summary = "TubeFlow has been removed from your system.";
                    if (isTotal)
                    {
                        summary = "Total removal completed: All TubeFlow files, settings, engines, and downloaded videos/audio have been purged.";
                    }
                    else if (isCleanOrTotal)
                    {
                        summary = "Clean uninstall completed: App, yt-dlp, FFmpeg, caches, and history were removed.\n\nYour downloaded videos in 'Downloads\\TubeFlow' were preserved.";
                    }
                    else
                    {
                        summary = "Standard uninstall completed: App files and shortcuts were removed.\n\nYour downloaded media and libraries were preserved.";
                    }

                    MessageBox.Show(summary, "Uninstall Successful", MessageBoxButtons.OK, MessageBoxIcon.Information);
                    this.Close();
                }));
            }
            catch (Exception ex)
            {
                this.Invoke(new Action(() =>
                {
                    MessageBox.Show("An error occurred during uninstallation: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    btnUninstall.Enabled = true;
                    btnCancel.Enabled = true;
                }));
            }
        }

        private static void KillProcess(string name)
        {
            try
            {
                foreach (Process p in Process.GetProcessesByName(name))
                {
                    try
                    {
                        p.Kill();
                        p.WaitForExit(1500);
                    }
                    catch { }
                }
            }
            catch { }
        }

        private static void SafeDeleteFile(string path)
        {
            try
            {
                if (File.Exists(path)) File.Delete(path);
            }
            catch { }
        }

        private static void SafeDeleteDirectory(string path)
        {
            try
            {
                if (Directory.Exists(path)) Directory.Delete(path, true);
            }
            catch { }
        }

        private static void RemoveRegistryKey(RegistryKey root, string subKey)
        {
            try
            {
                root.DeleteSubKeyTree(subKey, false);
            }
            catch { }
        }
    }
}
